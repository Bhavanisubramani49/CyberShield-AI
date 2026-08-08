import csv
from pathlib import Path
from typing import Dict, Any, List

def validate_dataset(filepath: str) -> Dict[str, Any]:
    """
    Validates dataset integrity without modifying original source files:
    - inspects columns
    - identifies target/label column
    - identifies missing values
    - identifies duplicate records
    - identifies class distribution
    - identifies usable records
    """
    path = Path(filepath)
    if not path.exists():
        return {
            "dataset_name": path.name,
            "status": "NOT_FOUND",
            "error": f"File not found: {filepath}"
        }

    rows = []
    with open(path, mode="r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        for r in reader:
            rows.append(r)

    total_rows = len(rows)
    total_cols = len(fieldnames)
    
    # Identify target column
    label_col = next((c for c in ["label", "target", "classification", "class"] if c in fieldnames), fieldnames[0] if fieldnames else "unknown")

    # Missing values & duplicate checking
    missing_count = 0
    seen_records = set()
    duplicate_count = 0
    class_dist: Dict[str, int] = {}

    for r in rows:
        # Check missing values
        if any(v is None or str(v).strip() == "" for v in r.values()):
            missing_count += 1

        # Check duplicates based on tuple of values
        rec_key = tuple(r.get(c, "") for c in fieldnames)
        if rec_key in seen_records:
            duplicate_count += 1
        else:
            seen_records.add(rec_key)

        # Class distribution
        lbl = str(r.get(label_col, "unknown")).strip().lower()
        class_dist[lbl] = class_dist.get(lbl, 0) + 1

    usable_rows = total_rows - missing_count

    return {
        "dataset_name": path.name,
        "filepath": str(path),
        "total_rows": total_rows,
        "columns": fieldnames,
        "total_columns": total_cols,
        "target_column": label_col,
        "missing_values": missing_count,
        "duplicate_records": duplicate_count,
        "classes": list(class_dist.keys()),
        "class_distribution": class_dist,
        "usable_rows": usable_rows,
        "status": "VALID" if usable_rows > 0 else "EMPTY"
    }
