#!/usr/bin/env python3
"""Section 30: build a single cross-platform multimodal training manifest."""
import argparse, json, os
from validate_dataset import load_jsonl

ASSET_FIELDS = {"photos": "path", "youtube": "video_path", "videos": "video_path", "files": "path",
                "web": "html_snapshot_path"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.join(os.path.dirname(__file__), "..", "datasets"))
    args = ap.parse_args()
    root = os.path.abspath(args.root)
    platforms = [d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))
                 and os.path.exists(os.path.join(root, d, "generated"))]
    out_path = os.path.join(root, "multimodal_manifest.jsonl")
    n = 0
    with open(out_path, "w") as out:
        for p in sorted(platforms):
            recs = load_jsonl(os.path.join(root, p, "generated", f"{p}.jsonl"))
            asset_field = ASSET_FIELDS.get(p)
            for r in recs:
                sample = {
                    "sample_id": r["record_id"],
                    "text": r.get("content") or r.get("transcript") or r.get("message") or r.get("body"),
                    "image": r.get("path") if p == "photos" else None,
                    "video": r.get("video_path") if p in ("youtube", "videos") else None,
                    "url": r.get("url"),
                    "platform": p,
                    "label": r.get("classification"),
                    "risk_score": r.get("risk_score"),
                    "explanation": r.get("explanation"),
                    "attack_chain_id": r.get("attack_chain_id"),
                    "duplicate_group_id": r.get("duplicate_group_id"),
                    "split": r.get("split"),
                    "user_holdout": r.get("user_holdout", False),
                }
                out.write(json.dumps(sample, ensure_ascii=False) + "\n")
                n += 1
    print(f"Wrote {n} multimodal samples to {out_path}")


if __name__ == "__main__":
    main()
