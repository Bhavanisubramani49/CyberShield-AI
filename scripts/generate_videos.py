import os, sys, subprocess, shlex
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, gen_id, random_timestamp, explanation_for,
                     risk_level_for, sha256_of_file)

SAFE_TITLES = [
    "5 Study Tips Every College Student Should Know",
    "Beginner's Guide to Home Cooking",
    "Top 10 Travel Destinations This Year",
    "Intro to Machine Learning in 10 Minutes",
    "How to Set Up Your First Robotics Project",
    "Campus Tech Fest Highlights",
    "Daily VLOG: Exploring New Cafes",
    "Python Programming Tutorial for Beginners",
    "Cybersecurity Fundamentals Overview",
    "Unboxing New Budget Smartphone",
]
MANIPULATED_TITLES = [
    "URGENT Official Announcement You Must See (synthetic demo)",
    "Leaked Statement From Company CEO (synthetic demo)",
    "Shocking News Update Everyone Is Sharing (synthetic demo)",
    "Exclusive Video Proof (synthetic demo)",
    "Fake Celebrity Endorsement Clip (synthetic demo)",
    "AI Deepfake Voice Over Scam Alert (synthetic demo)",
]
CATEGORY_SAFE = ["educational", "technology", "cooking", "travel", "sports", "interview", "tutorial", "gaming"]
THREAT_TYPES = ["deepfake_face", "lip_sync_manipulation", "ai_generated_speaker", "misleading_edit", "fabricated_announcement"]

FFMPEG_BIN = "ffmpeg"


def _make_clip(path, text, color="0x2b6cb0", duration=3, size="320x240"):
    """Render a short, clearly-labeled synthetic MP4 clip using ffmpeg's
    built-in test source + drawtext (no external video assets used)."""
    safe_text = text.replace("'", "").replace(":", "-")[:60]
    filter_str = (
        f"drawtext=text='{safe_text}':fontcolor=white:fontsize=14:x=10:y=h-30:"
        f"box=1:boxcolor=black@0.5,drawtext=text='SYNTHETIC DEMO':fontcolor=yellow:"
        f"fontsize=12:x=10:y=10:box=1:boxcolor=black@0.5"
    )
    cmd = (f"{FFMPEG_BIN} -y -f lavfi -i color=c={color}:s={size}:d={duration} "
           f"-f lavfi -i anullsrc=r=8000:cl=mono -shortest "
           f"-vf \"{filter_str}\" -pix_fmt yuv420p -t {duration} {shlex.quote(path)}")
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-800:])


def _make_thumbnail(video_path, thumb_path):
    cmd = f"{FFMPEG_BIN} -y -i {shlex.quote(video_path)} -ss 00:00:01 -frames:v 1 {shlex.quote(thumb_path)}"
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def generate(users, seed, out_dir=None, min_records_per_user=52, platform="youtube", skip_media=True):
    """platform: 'youtube' or 'videos'. Ensures >=52 items per user."""
    records = []
    global_counter = 1

    if out_dir and not skip_media:
        vids_dir = os.path.join(out_dir, "videos" if platform == "youtube" else "originals")
        thumbs_dir = os.path.join(out_dir, "thumbnails" if platform == "youtube" else "manipulated")
        os.makedirs(vids_dir, exist_ok=True)
        os.makedirs(thumbs_dir, exist_ok=True)

    for u in users:
        u_id = u["user_id"]
        rng = make_rng(seed, u_id, platform)

        for i in range(min_records_per_user):
            vid_id = gen_id("VID" if platform == "videos" else "YT", global_counter)
            global_counter += 1

            is_manip = rng.random() < 0.25
            title = rng.choice(MANIPULATED_TITLES if is_manip else SAFE_TITLES)
            color = rng.choice(["0x2b6cb0", "0x2f855a", "0x975a16", "0xc53030"])
            
            orig_name = f"{vid_id}_original.mp4"
            thumb_name = f"{vid_id}_thumb.jpg"
            
            ok = False
            orig_path = None
            thumb_path = None

            if out_dir and not skip_media:
                vids_dir = os.path.join(out_dir, "videos" if platform == "youtube" else "originals")
                thumbs_dir = os.path.join(out_dir, "thumbnails" if platform == "youtube" else "manipulated")
                orig_path = os.path.join(vids_dir, orig_name)
                thumb_path = os.path.join(thumbs_dir, thumb_name)
                try:
                    _make_clip(orig_path, title, color=color, duration=rng.choice([3, 4, 5]))
                    ok = os.path.exists(orig_path) and os.path.getsize(orig_path) > 0
                    if ok:
                        _make_thumbnail(orig_path, thumb_path)
                except Exception:
                    ok = False

            transcript = title + ". " + ("This is an original synthetic clip made for CyberShield training data." if not is_manip
                                          else "This clip simulates a manipulated/deepfake-style video for detector training; it is entirely synthetic.")
            threat_type = rng.choice(THREAT_TYPES) if is_manip else "none"
            score = rng.randint(60, 96) if is_manip else rng.randint(3, 22)
            level = risk_level_for(score)
            cls = "manipulated" if is_manip else "safe"
            indicators = ["synthetic_speaker_signature", "audio_video_mismatch"] if is_manip else []

            rec = {
                "record_id": vid_id,
                "video_id": vid_id,
                "user_id": u_id,
                "creator_id": u_id,
                "platform": platform,
                "content_type": "video",
                "title": title,
                "description": transcript,
                "duration_seconds": rng.choice([3, 4, 5, 10, 15, 30]),
                "video_path": os.path.relpath(orig_path, out_dir) if ok else f"{platform}/{orig_name}",
                "thumbnail_path": os.path.relpath(thumb_path, out_dir) if ok else f"thumbnails/{thumb_name}",
                "transcript": transcript,
                "content": transcript,
                "frame_paths": [],
                "audio_metadata": {"channels": 1, "sample_rate": 8000, "codec": "aac_silent_demo"},
                "classification": cls,
                "risk_score": score,
                "risk_level": level,
                "threat_type": threat_type,
                "threat_indicators": indicators,
                "explanation": explanation_for(cls if cls != "safe" else "safe", indicators, platform),
                "recommended_action": "block" if level == "critical" else ("warn" if level in ("high", "medium") else "allow"),
                "ground_truth": "benign" if cls == "safe" else "malicious",
                "duplicate_group_id": None,
                "attack_chain_id": None,
                "asset_generation_ok": ok,
                "timestamp": random_timestamp(rng),
            }
            records.append(rec)

    return records
