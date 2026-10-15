# CyberShield AI — Synthetic Cybersecurity Dataset

Fully synthetic, multi-platform, multi-user, multimodal dataset for training and
evaluating CyberShield AI's threat-detection models (phishing, scams, social
engineering, malicious attachments, deepfakes/manipulated media, misinformation).

**Everything here is synthetic.** No real people, real messages, real phone
numbers, real credentials, real malware, or real phishing infrastructure is
used anywhere. Unsafe-looking web pages are static, disabled-form HTML demos
on reserved test domains (`example.test`, `cybershield.test`, `security-demo.test`,
`example.invalid`) — they don't submit or collect anything.

## What's here

This is a **preview run**, not the full 10,000-records-per-platform target
(see "Scaling to full size" below for why, and how to get there).

| Platform  | Records | Real assets rendered | Train | Val | Test |
|-----------|--------:|-----------------------|------:|----:|-----:|
| whatsapp  | 600 | — | 445 | 79 | 76 |
| instagram | 600 | — | 444 | 83 | 73 |
| sms       | 600 | — | 410 | 103 | 87 |
| email     | 600 | — | 428 | 83 | 89 |
| news      | 600 | — | 425 | 103 | 72 |
| web       | 600 | 60 static HTML snapshots | 405 | 99 | 96 |
| photos    | 240 | 240 real JPGs | 180 | 32 | 28 |
| youtube   | 30 | 30 real playable MP4s + thumbnails | 27 | 2 | 1 |
| videos    | 30 | 30 real playable MP4s (originals + re-encoded/trimmed variants) | 25 | 3 | 2 |
| files     | 150 | 150 real PDF/DOCX/XLSX/TXT/CSV files | 98 | 26 | 26 |

50 synthetic users (`datasets/users.json`), class distribution close to the
45/20/20/10/5 (safe/suspicious/malicious/phishing/manipulated) target — see
`dataset_statistics.json` for the exact per-platform breakdown.

## Directory layout

```
datasets/
  users.json                  # 50 synthetic users, each with a per-platform handle
  dataset_manifest.json        # record counts, split counts, seed, generator version
  dataset_statistics.json/csv  # per-platform class/threat/content-type distributions
  validation_report.json       # output of validate_dataset.py
  multimodal_manifest.jsonl    # one row per sample across ALL platforms, for training
  <platform>/
    generated/<platform>.jsonl # full record set for that platform
    train/ validation/ test/   # pre-split JSONL files
    <asset dirs>                # photos/originals,duplicates,manipulated;
                                 # youtube/videos,thumbnails; videos/originals,manipulated;
                                 # web/html; files/documents
```

## Common record schema

Every record has at minimum:

```json
{
  "record_id": "WA_000123",
  "user_id": "USER_007",
  "platform": "whatsapp",
  "content_type": "text",
  "classification": "phishing",        // safe | suspicious | malicious | phishing | manipulated
  "risk_score": 92,                     // 0-100, overlapping bands by design (see below)
  "risk_level": "critical",             // low | medium | high | critical
  "threat_type": "credential_phishing",
  "threat_indicators": ["urgency_language", "brand_impersonation"],
  "explanation": "...",                 // human-readable, for the explainable-AI layer
  "recommended_action": "block",        // allow | warn | block
  "ground_truth": "malicious",          // benign | suspicious | malicious
  "duplicate_group_id": null,           // set for photos/videos duplicate families
  "attack_chain_id": null,              // set when part of a cross-platform chain
  "split": "train",                     // train | validation | test
  "user_holdout": false                 // true if this record's user is in the holdout set
}
```
Each platform adds its own fields on top (see the generator scripts in `scripts/`
for the authoritative field list per platform).

### Risk scoring
Scores are intentionally noisy near class boundaries rather than fixed
per-class constants (e.g. safe≈2–28, suspicious≈23–62, malicious/phishing
higher, with overlap) so risk-score regression and threshold tuning are
meaningful tasks, not trivial lookups.

### `currentUserId` integration
Every record carries `user_id`. To show "USER_007's WhatsApp" in a UI, filter
`datasets/whatsapp/generated/whatsapp.jsonl` (or the relevant split file) by
`user_id == currentUserId`. Nothing is hard-coded to a specific user — switching
`currentUserId` changes which slice of every platform's dataset is shown.

## Train / validation / test splitting (no leakage)

Records are grouped **before** splitting by, in priority order:
`duplicate_group_id` → `attack_chain_id` → (else split independently).
A duplicate-photo family or a 3-step cross-platform attack chain always lands
entirely in one split — never partly in train and partly in test. This is
verified automatically by `validate_dataset.py` (`Cross-split leakage groups`
must be 0; it is 0 in this preview run).

`source_template_id` is kept as metadata only (it's a coarse content hash, not
a true near-duplicate signal) and is not used for splitting, because doing so
produced false "leakage" whenever an incidental hash collision touched an
unrelated attack chain.

`user_holdout: true` marks records belonging to a held-out subset of users
(10 of the 50, none seen with `split_group: "holdout_test"` in `users.json`).
Filter `test` records by `user_holdout == true` to specifically evaluate
whether the model generalizes to unseen users rather than memorizing names/handles.

## Cross-platform attack chains

`attack_chain_id` links records across platforms into a coherent story, e.g.
`instagram DM → web (fake site) → email (phishing follow-up)` or
`whatsapp (suspicious doc) → files (file analysis)`. See `chain_pattern` and
`chain_step` fields on tagged records. This preview linked 121 chains / 272 records
across 5 chain patterns — see `dataset_manifest.json` → `attack_chains`.

## Regenerating / scaling up

```bash
cd scripts
# Preview (fast, what was used to produce this delivery):
python3 generate_all.py --seed 42 --users 50 --records-per-platform 600 \
    --images 240 --videos 30 --video-clips 30 --files 150 --attack-chains 150

# Full spec-target scale (10,000+ per platform) — see "Limitations" below first:
python3 generate_all.py --seed 42 --users 50 --records-per-platform 10000 \
    --images 10000 --videos 2000 --video-clips 2000 --files 10000 --attack-chains 2000

# Metadata-only (no image/video/document rendering, much faster):
python3 generate_all.py --seed 42 --users 50 --records-per-platform 10000 --skip-media
```
`--seed` controls everything deterministically; change it to get a different
(but internally consistent) dataset.

## Validation & statistics

```bash
python3 validate_dataset.py --root ../datasets      # -> validation_report.json
python3 dataset_stats.py --root ../datasets          # -> dataset_statistics.json/csv
python3 build_multimodal_manifest.py --root ../datasets  # -> multimodal_manifest.jsonl
```

## Adding new users or threat types

- **New users:** raise `--users N` and regenerate, or hand-append to
  `users.json` following the existing shape, then re-run the platform
  generator(s) you need (`generate_whatsapp.generate(users, seed, n)` etc. are
  plain importable functions).
- **New threat types:** add a template/topic to the relevant list at the top of
  the platform's `generate_<platform>.py` (e.g. `TOPICS_PHISHING_TEXT`,
  `THREAT_TYPE_MAP`) and add the new value to `THREAT_TAXONOMY` in `common.py`.

## Limitations (read before training on this at scale)

1. **This delivery is a preview, not 10,000+ records/platform.** Text platforms
   (whatsapp/instagram/sms/email/news/web) generate fast and *can* be run at
   10,000+ immediately. Photos/videos/files render real assets and are the
   bottleneck — 240 photos took a few seconds, so 10,000 is feasible but will
   take materially longer and produce a much larger output; 2,000 real MP4s
   via ffmpeg is a multi-minute-to-hour job depending on hardware, not
   something to run inline in a chat session.
2. **Videos are not deepfakes.** They are clearly-labeled synthetic MP4 clips
   (color background + on-screen text via ffmpeg) representing what a
   "manipulated video" record looks like structurally — there is no actual
   face-swap/lip-sync model in this pipeline, by design (creating real deepfake
   generation tooling is out of scope and something to be careful about).
   Classification labels are correct for training a detector on the metadata/
   structural pattern, not on visual deepfake artifacts.
3. **Text content draws from a bounded set of templates** per platform (10–15
   safe phrases, similar for threat phrases), parameterized per record. This
   keeps generation fast and reviewable but means literal text diversity is
   lower than 10,000 hand-written messages would give you. For serious model
   training at full scale, plan to expand the template pools (or swap in an
   LLM-based paraphraser over these templates) before relying on text
   diversity alone.
4. **Perceptual hashing** for photos uses a simple 8×8 average hash (no
   external pHash dependency) — adequate for demonstrating duplicate/near-
   duplicate relationships, not a production-grade perceptual hash.
5. **No existing CyberShield backend/repo was available to inspect** in this
   environment, so schema fields were designed to be easy to map onto typical
   `users` / `conversations` / `messages` / `security_events` /
   `notifications` / `attachments` tables (stable `record_id`, `user_id`,
   optional `security_event_id` slot) rather than generated against your
   actual schema. Please review field names against your real backend before
   ingesting.
