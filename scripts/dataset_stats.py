#!/usr/bin/env python3
"""Section 26: dataset_stats.py — per-platform statistics -> CSV + JSON."""
import argparse, csv, json, os
from collections import Counter
from validate_dataset import load_jsonl


def stats_for(root, platform):
    recs = load_jsonl(os.path.join(root, platform, "generated", f"{platform}.jsonl"))
    if not recs:
        return None
    cls_counts = Counter(r.get("classification") for r in recs)
    threat_counts = Counter(r.get("threat_type") for r in recs)
    ctype_counts = Counter(r.get("content_type") for r in recs)
    user_counts = Counter(r.get("user_id") for r in recs)
    scores = [r.get("risk_score", 0) for r in recs]
    splits = Counter(r.get("split") for r in recs)
    scores_sorted = sorted(scores)
    median = scores_sorted[len(scores_sorted) // 2] if scores_sorted else 0
    return {
        "platform": platform,
        "total_records": len(recs),
        "classification_distribution": dict(cls_counts),
        "threat_type_distribution": dict(threat_counts.most_common(10)),
        "content_type_distribution": dict(ctype_counts),
        "unique_users": len(user_counts),
        "avg_risk_score": round(sum(scores) / len(scores), 2) if scores else 0,
        "median_risk_score": median,
        "train": splits.get("train", 0),
        "validation": splits.get("validation", 0),
        "test": splits.get("test", 0),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.join(os.path.dirname(__file__), "..", "datasets"))
    args = ap.parse_args()
    root = os.path.abspath(args.root)
    platforms = [d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))
                 and os.path.exists(os.path.join(root, d, "generated"))]
    all_stats = []
    for p in sorted(platforms):
        s = stats_for(root, p)
        if s:
            all_stats.append(s)
    with open(os.path.join(root, "dataset_statistics.json"), "w") as f:
        json.dump(all_stats, f, indent=2)
    with open(os.path.join(root, "dataset_statistics.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["platform", "total_records", "avg_risk_score", "median_risk_score",
                    "unique_users", "train", "validation", "test"])
        for s in all_stats:
            w.writerow([s["platform"], s["total_records"], s["avg_risk_score"], s["median_risk_score"],
                        s["unique_users"], s["train"], s["validation"], s["test"]])
    print(f"Wrote statistics for {len(all_stats)} platforms.")


if __name__ == "__main__":
    main()
