#!/usr/bin/env python3
"""
CyberShield AI — master dataset generator for per-user, per-platform realistic datasets.

Usage:
    python generate_all.py --seed 42 --users 50 --skip-media
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))
from common import build_users, write_jsonl, gen_id
import generate_whatsapp, generate_instagram, generate_sms, generate_email
import generate_news, generate_web, generate_photos, generate_videos, generate_files
from attack_chains import link_attack_chains
from split import assign_split


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--users", type=int, default=50)
    ap.add_argument("--min-items-per-user", type=int, default=52)
    ap.add_argument("--attack-chains", type=int, default=200)
    ap.add_argument("--out", type=str, default=os.path.join(os.path.dirname(__file__), "..", "datasets"))
    ap.add_argument("--skip-media", action="store_true", default=True,
                     help="Skip actually rendering heavy image/video binary clips (generates metadata records).")
    args = ap.parse_args()

    t0 = time.time()
    out_root = os.path.abspath(args.out)
    os.makedirs(out_root, exist_ok=True)

    users = build_users(args.seed, args.users)
    with open(os.path.join(out_root, "users.json"), "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)
    users_by_id = {u["user_id"]: u for u in users}
    print(f"[users] generated {len(users)} synthetic users")

    all_records = {}

    # 1. WhatsApp
    recs_wa = generate_whatsapp.generate(users, args.seed, min_contacts_per_user=args.min_items_per_user)
    all_records["whatsapp"] = recs_wa
    print(f"[whatsapp] generated {len(recs_wa)} records across {len(users)} users")

    # 2. Instagram
    recs_ig = generate_instagram.generate(users, args.seed, min_entities_per_user=args.min_items_per_user)
    all_records["instagram"] = recs_ig
    print(f"[instagram] generated {len(recs_ig)} records across {len(users)} users")

    # 3. SMS
    recs_sms = generate_sms.generate(users, args.seed, min_threads_per_user=args.min_items_per_user)
    all_records["sms"] = recs_sms
    print(f"[sms] generated {len(recs_sms)} records across {len(users)} users")

    # 4. Email
    recs_em = generate_email.generate(users, args.seed, min_threads_per_user=args.min_items_per_user)
    all_records["email"] = recs_em
    print(f"[email] generated {len(recs_em)} records across {len(users)} users")

    # 5. News
    recs_news = generate_news.generate(users, args.seed, min_records_per_user=args.min_items_per_user)
    all_records["news"] = recs_news
    print(f"[news] generated {len(recs_news)} records across {len(users)} users")

    # 6. Web
    web_html_dir = os.path.join(out_root, "web", "html") if not args.skip_media else None
    if web_html_dir:
        os.makedirs(web_html_dir, exist_ok=True)
    recs_web = generate_web.generate(users, args.seed, min_records_per_user=args.min_items_per_user, html_dir=web_html_dir)
    all_records["web"] = recs_web
    print(f"[web] generated {len(recs_web)} records across {len(users)} users")

    # 7. Photos
    recs_photos = generate_photos.generate(users, args.seed, min_records_per_user=args.min_items_per_user)
    all_records["photos"] = recs_photos
    print(f"[photos] generated {len(recs_photos)} records across {len(users)} users")

    # 8. Videos (YouTube + Video clips)
    recs_yt = generate_videos.generate(users, args.seed, min_records_per_user=args.min_items_per_user, platform="youtube", skip_media=args.skip_media)
    all_records["youtube"] = recs_yt
    print(f"[youtube] generated {len(recs_yt)} records across {len(users)} users")

    recs_vid = generate_videos.generate(users, args.seed, min_records_per_user=args.min_items_per_user, platform="videos", skip_media=args.skip_media)
    all_records["videos"] = recs_vid
    print(f"[videos] generated {len(recs_vid)} records across {len(users)} users")

    # 9. Files
    recs_files = generate_files.generate(users, args.seed, min_records_per_user=args.min_items_per_user, skip_media=args.skip_media)
    all_records["files"] = recs_files
    print(f"[files] generated {len(recs_files)} records across {len(users)} users")

    # Attack Chains Linking
    chain_stats = link_attack_chains(all_records, args.seed, n_chains=args.attack_chains)
    print(f"[attack_chains] {chain_stats}")

    # Write per-platform files and manifest
    manifest_platforms = {}
    for platform, recs in all_records.items():
        assign_split(recs, users_by_id, args.seed)
        p_dir = os.path.join(out_root, platform)
        os.makedirs(os.path.join(p_dir, "generated"), exist_ok=True)
        os.makedirs(os.path.join(p_dir, "train"), exist_ok=True)
        os.makedirs(os.path.join(p_dir, "validation"), exist_ok=True)
        os.makedirs(os.path.join(p_dir, "test"), exist_ok=True)

        write_jsonl(os.path.join(p_dir, "generated", f"{platform}.jsonl"), recs)
        for split_name in ("train", "validation", "test"):
            subset = [r for r in recs if r["split"] == split_name]
            write_jsonl(os.path.join(p_dir, split_name, f"{platform}_{split_name}.jsonl"), subset)
        manifest_platforms[platform] = {
            "record_count": len(recs),
            "train": sum(1 for r in recs if r["split"] == "train"),
            "validation": sum(1 for r in recs if r["split"] == "validation"),
            "test": sum(1 for r in recs if r["split"] == "test"),
        }
        print(f"[{platform}] split -> train={manifest_platforms[platform]['train']} "
              f"val={manifest_platforms[platform]['validation']} test={manifest_platforms[platform]['test']}")

    manifest = {
        "schema_version": "1.0",
        "generator_version": "2.0_large_scale",
        "generation_seed": args.seed,
        "users": len(users),
        "platforms": manifest_platforms,
        "attack_chains": chain_stats,
        "generated_in_seconds": round(time.time() - t0, 2),
    }
    with open(os.path.join(out_root, "dataset_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nDone in {manifest['generated_in_seconds']}s. Manifest written to dataset_manifest.json")


if __name__ == "__main__":
    main()
