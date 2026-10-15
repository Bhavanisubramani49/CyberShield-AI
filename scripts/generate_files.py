import os, sys, csv
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, gen_id, random_timestamp, explanation_for,
                     risk_level_for, sha256_of_file, shannon_entropy)

SAFE_KINDS = [
    "report", "assignment", "invoice", "meeting_notes", "project_document",
    "budget_proposal", "research_paper", "lab_manual", "presentation_deck", "resume"
]
THREAT_KINDS = [
    "suspicious_macro_document", "executable_like_metadata", "suspicious_archive_metadata", "altered_document",
    "phishing_attachment_pdf", "ransomware_stager_doc"
]


def generate(users, seed, out_dir=None, min_records_per_user=52, skip_media=True):
    """Generates file metadata records per user deterministically."""
    records = []
    ext_makers = ["pdf", "docx", "xlsx", "txt", "csv"]
    global_counter = 1

    if out_dir and not skip_media:
        docs_dir = os.path.join(out_dir, "documents")
        os.makedirs(docs_dir, exist_ok=True)

    for u in users:
        u_id = u["user_id"]
        rng = make_rng(seed, u_id, "files")

        for i in range(min_records_per_user):
            fid = gen_id("FILE", global_counter)
            global_counter += 1

            is_threat = rng.random() < 0.25
            kind = rng.choice(THREAT_KINDS if is_threat else SAFE_KINDS)
            ext = rng.choice(ext_makers)
            title = f"{kind.replace('_',' ').title()} — {fid}"
            body = ("This is a synthetic, harmless document generated for CyberShield AI training. "
                    "It contains no real personal data, credentials, or executable code. "
                    f"Category: {kind}.")
            fname = f"{fid}.{ext}"

            ok = False
            size = rng.randint(1024, 5242880)
            entropy = rng.uniform(3.5, 7.8)

            if out_dir and not skip_media:
                path = os.path.join(docs_dir, fname)
                try:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(title + "\n\n" + body)
                    ok = os.path.exists(path)
                    if ok:
                        size = os.path.getsize(path)
                except Exception:
                    ok = False

            macro_present = is_threat and ext in ("docx", "xlsx") and rng.random() < 0.5
            embedded_objects = is_threat and rng.random() < 0.3
            score = rng.randint(55, 92) if is_threat else rng.randint(2, 22)
            level = risk_level_for(score)
            cls = "malicious" if is_threat and score >= 70 else ("suspicious" if is_threat else "safe")
            indicators = []
            if macro_present:
                indicators.append("macro_present_simulation")
            if embedded_objects:
                indicators.append("embedded_object_simulation")
            if is_threat and not indicators:
                indicators.append("suspicious_file_pattern_simulation")

            rec = {
                "record_id": fid,
                "file_id": fid,
                "user_id": u_id,
                "platform": "files",
                "content_type": "document",
                "filename": fname,
                "extension": ext,
                "mime_type": {
                    "pdf": "application/pdf",
                    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "txt": "text/plain", "csv": "text/csv",
                }[ext],
                "path": f"documents/{fname}",
                "size": size,
                "hash": f"hash_{fid.lower()}",
                "entropy": round(entropy, 3),
                "macro_present": macro_present,
                "embedded_objects": embedded_objects,
                "content": title + " — " + body,
                "classification": cls,
                "risk_score": score,
                "risk_level": level,
                "threat_type": kind if is_threat else "none",
                "threat_indicators": indicators,
                "explanation": explanation_for(cls, indicators, "files"),
                "recommended_action": "block" if level == "critical" else ("warn" if level in ("high", "medium") else "allow"),
                "ground_truth": "benign" if cls == "safe" else "malicious" if cls == "malicious" else "suspicious",
                "duplicate_group_id": None,
                "attack_chain_id": None,
                "timestamp": random_timestamp(rng),
                "asset_generation_ok": ok,
            }
            records.append(rec)

    return records
