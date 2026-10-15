import os, sys, io
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from common import (make_rng, gen_id, random_timestamp, explanation_for,
                     risk_level_for, sha256_of_file)

CATEGORIES_SAFE = ["portrait", "landscape", "college_event", "document_scan", "food", "travel", "screenshot", "product"]
CATEGORIES_THREAT = ["fake_payment_screenshot", "forged_id_demo", "spliced_image", "ai_generated_face"]


def _ahash(img):
    """Simple average hash (perceptual hash) — no external dependency."""
    small = img.convert("L").resize((8, 8))
    pixels = list(small.getdata())
    avg = sum(pixels) / len(pixels)
    bits = "".join("1" if p >= avg else "0" for p in pixels)
    return "%016x" % int(bits, 2)


def _draw_base_image(rng, category, size=(320, 240)):
    img = Image.new("RGB", size, color=tuple(rng.randint(30, 220) for _ in range(3)))
    draw = ImageDraw.Draw(img)
    if category in ("landscape", "travel"):
        draw.rectangle([0, size[1] * 2 // 3, size[0], size[1]], fill=(60, 140, 60))
        draw.ellipse([size[0] - 60, 10, size[0] - 10, 60], fill=(250, 220, 90))
    elif category in ("portrait", "ai_generated_face"):
        draw.ellipse([size[0] // 2 - 50, 40, size[0] // 2 + 50, 140], fill=(210, 170, 140))
        draw.rectangle([size[0] // 2 - 60, 140, size[0] // 2 + 60, 230], fill=(80, 80, 120))
    elif category in ("document_scan", "forged_id_demo"):
        img = Image.new("RGB", size, color=(245, 245, 245))
        draw = ImageDraw.Draw(img)
        for y in range(30, size[1] - 20, 20):
            draw.line([(20, y), (size[0] - 20, y)], fill=(180, 180, 180), width=2)
        draw.rectangle([15, 15, size[0] - 15, size[1] - 15], outline=(0, 0, 0), width=2)
    elif category in ("fake_payment_screenshot", "screenshot"):
        img = Image.new("RGB", size, color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.rectangle([10, 10, size[0] - 10, 60], fill=(20, 120, 60))
        draw.text((20, 25), "Payment Successful (DEMO)", fill=(255, 255, 255))
        draw.text((20, 90), f"Amount: Rs. {rng.randint(500,9000)}.00 (synthetic)", fill=(0, 0, 0))
        draw.text((20, 120), "Txn ID: DEMO-" + str(rng.randint(100000, 999999)), fill=(0, 0, 0))
    elif category == "food":
        draw.ellipse([60, 60, 260, 200], fill=(230, 190, 120))
        draw.ellipse([100, 90, 220, 170], fill=(200, 90, 60))
    elif category == "spliced_image":
        draw.rectangle([0, 0, size[0] // 2, size[1]], fill=(200, 200, 200))
        draw.rectangle([size[0] // 2, 0, size[0], size[1]], fill=(90, 130, 200))
        draw.line([(size[0] // 2, 0), (size[0] // 2, size[1])], fill=(255, 0, 0), width=1)
    else:  # college_event / product / generic
        for _ in range(6):
            x0, y0 = rng.randint(0, size[0]), rng.randint(0, size[1])
            x1, y1 = x0 + rng.randint(20, 80), y0 + rng.randint(20, 80)
            draw.rectangle([x0, y0, x1, y1], outline=tuple(rng.randint(0, 255) for _ in range(3)))
    draw.text((5, size[1] - 15), f"id:{rng.randint(0,999999)}", fill=(0, 0, 0))
    return img


def generate(users, seed, out_dir=None, min_records_per_user=52):
    records = []
    global_record_counter = 1

    for u_idx, u in enumerate(users):
        u_id = u["user_id"]
        user_rng = make_rng(seed, u_id, "photos")

        for i in range(min_records_per_user):
            rid = gen_id("IMG", global_record_counter)
            global_record_counter += 1

            is_threat = user_rng.random() < 0.25
            category = user_rng.choice(CATEGORIES_THREAT if is_threat else CATEGORIES_SAFE)
            fname = f"{rid}_{category}.jpg"
            score = user_rng.randint(2, 20) if not is_threat else user_rng.randint(60, 95)
            level = risk_level_for(score)
            cls = "safe" if not is_threat else "manipulated"
            indicators = [] if not is_threat else ["pixel_level_anomaly"]

            rec = {
                "record_id": rid,
                "user_id": u_id,
                "platform": "photos",
                "content_type": "image",
                "path": f"photos/{fname}",
                "width": 1280,
                "height": 720,
                "format": "JPEG",
                "hash": f"hash_{rid.lower()}",
                "perceptual_hash": f"phash_{rid.lower()}",
                "category": category,
                "classification": cls,
                "manipulation_type": "none" if not is_threat else "spliced",
                "risk_score": score,
                "risk_level": level,
                "threat_indicators": indicators,
                "explanation": explanation_for(cls, indicators, "photos"),
                "recommended_action": "allow" if not is_threat else "block",
                "ground_truth": "benign" if not is_threat else "malicious",
                "timestamp": random_timestamp(user_rng)
            }
            records.append(rec)
    return records
