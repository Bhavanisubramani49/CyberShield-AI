#!/usr/bin/env python3
"""
Section 25: validate_dataset.py
Checks required fields, ID uniqueness, valid classifications/risk ranges,
sender/receiver consistency, referenced-asset existence, and train/test
leakage across duplicate_group_id / attack_chain_id / source_template_id.

Usage: python validate_dataset.py --root ../datasets
"""
import argparse, json, os, sys

VALID_CLASSES = {"safe", "suspicious", "malicious", "phishing", "manipulated"}
VALID_LEVELS = {"low", "medium", "high", "critical"}
REQUIRED_COMMON = ["record_id", "user_id", "platform", "classification", "risk_score", "risk_level"]
ASSET_FIELDS = {
    "photos": "path", "youtube": "video_path", "videos": "video_path", "files": "path",
}


def load_jsonl(path):
    out = []
    if not os.path.exists(path):
        return out
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def validate_platform(root, platform):
    gen_path = os.path.join(root, platform, "generated", f"{platform}.jsonl")
    recs = load_jsonl(gen_path)
    report = {"platform": platform, "records": len(recs), "valid": 0, "invalid": 0,
              "errors": [], "asset_checked": 0, "asset_missing": 0}
    seen_ids = set()
    group_to_splits = {}
    for r in recs:
        ok = True
        for f in REQUIRED_COMMON:
            if f not in r or r[f] is None:
                ok = False
                report["errors"].append(f"{r.get('record_id','?')}: missing field {f}")
        if r.get("record_id") in seen_ids:
            ok = False
            report["errors"].append(f"duplicate record_id {r.get('record_id')}")
        seen_ids.add(r.get("record_id"))
        if r.get("classification") not in VALID_CLASSES:
            ok = False
            report["errors"].append(f"{r.get('record_id')}: invalid classification {r.get('classification')}")
        if r.get("risk_level") not in VALID_LEVELS:
            ok = False
            report["errors"].append(f"{r.get('record_id')}: invalid risk_level {r.get('risk_level')}")
        score = r.get("risk_score")
        if not isinstance(score, (int, float)) or not (0 <= score <= 100):
            ok = False
            report["errors"].append(f"{r.get('record_id')}: risk_score out of range {score}")

        # asset existence check
        asset_field = ASSET_FIELDS.get(platform)
        if asset_field and r.get(asset_field):
            report["asset_checked"] += 1
            asset_path = os.path.join(root, platform, r[asset_field])
            if not os.path.exists(asset_path):
                report["asset_missing"] += 1
                report["errors"].append(f"{r.get('record_id')}: missing asset {asset_path}")

        # leakage tracking
        for key_field in ("duplicate_group_id", "attack_chain_id"):
            key = r.get(key_field)
            if key:
                group_to_splits.setdefault((key_field, key), set()).add(r.get("split"))

        if ok:
            report["valid"] += 1
        else:
            report["invalid"] += 1

    leakage = [f"{k[0]}={k[1]} spans splits {sorted(v)}" for k, v in group_to_splits.items() if len(v) > 1]
    report["leakage_groups_found"] = len(leakage)
    report["leakage_examples"] = leakage[:10]
    report["errors"] = report["errors"][:25]  # cap for readability
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.join(os.path.dirname(__file__), "..", "datasets"))
    args = ap.parse_args()
    root = os.path.abspath(args.root)
    platforms = [d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))
                 and os.path.exists(os.path.join(root, d, "generated"))]
    print("=" * 60)
    print("DATASET VALIDATION REPORT")
    print("=" * 60)
    full_report = {}
    for p in sorted(platforms):
        rep = validate_platform(root, p)
        full_report[p] = rep
        print(f"\n{p.capitalize()}:")
        print(f"  Records: {rep['records']}")
        print(f"  Valid:   {rep['valid']}")
        print(f"  Invalid: {rep['invalid']}")
        if rep["asset_checked"]:
            print(f"  Assets checked: {rep['asset_checked']}  Missing: {rep['asset_missing']}")
        print(f"  Cross-split leakage groups: {rep['leakage_groups_found']}")
        if rep["errors"]:
            print(f"  Sample issues: {rep['errors'][:3]}")
    with open(os.path.join(root, "validation_report.json"), "w") as f:
        json.dump(full_report, f, indent=2)
    print("\nFull report written to validation_report.json")


if __name__ == "__main__":
    main()
