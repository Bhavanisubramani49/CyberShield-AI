from typing import Dict, Any, List

def compute_classification_metrics(y_true: List[str], y_pred: List[str]) -> Dict[str, Any]:
    """
    Computes comprehensive evaluation metrics:
    - Accuracy
    - Precision
    - Recall
    - Macro F1
    - Weighted F1
    - Confusion Matrix counts
    """
    if not y_true or not y_pred or len(y_true) != len(y_pred):
        return {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "macro_f1": 0.0,
            "weighted_f1": 0.0,
            "sample_count": 0
        }

    total = len(y_true)
    correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt.lower() == yp.lower())
    accuracy = round(correct / max(1, total), 4)

    classes = sorted(list(set(yt.lower() for yt in y_true)))
    precisions = []
    recalls = []
    f1s = []
    class_weights = []

    conf_matrix: Dict[str, Dict[str, int]] = {c: {c2: 0 for c2 in classes} for c in classes}
    for yt, yp in zip(y_true, y_pred):
        yt_l = yt.lower()
        yp_l = yp.lower() if yp.lower() in classes else classes[0]
        conf_matrix[yt_l][yp_l] += 1

    for c in classes:
        tp = conf_matrix[c][c]
        fp = sum(conf_matrix[other][c] for other in classes if other != c)
        fn = sum(conf_matrix[c][other] for other in classes if other != c)

        prec = tp / max(1, (tp + fp))
        rec = tp / max(1, (tp + fn))
        f1 = (2 * prec * rec) / max(0.0001, (prec + rec))

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)
        class_weights.append(tp + fn)

    macro_prec = round(sum(precisions) / max(1, len(classes)), 4)
    macro_rec = round(sum(recalls) / max(1, len(classes)), 4)
    macro_f1 = round(sum(f1s) / max(1, len(classes)), 4)

    # Weighted F1
    total_samples = sum(class_weights)
    weighted_f1 = round(sum(f1 * w for f1, w in zip(f1s, class_weights)) / max(1, total_samples), 4)

    return {
        "accuracy": accuracy,
        "precision": macro_prec,
        "recall": macro_rec,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "sample_count": total,
        "classes": classes,
        "confusion_matrix": conf_matrix
    }
