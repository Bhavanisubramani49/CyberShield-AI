"""
Links records across platforms into shared attack_chain_id groups
(Section 16 / 17). Chooses already-risky records so the "story" is coherent,
then stamps a shared attack_chain_id + chain_step + chain_pattern on each.
"""
from common import make_rng, gen_id

CHAIN_PATTERNS = [
    ("instagram", "web", "email"),          # DM -> suspicious URL -> (fake site) -> phishing follow-up
    ("whatsapp", "files"),                  # malicious-looking doc -> file analysis
    ("youtube", "news"),                    # deepfake-style video -> misleading claim
    ("email", "files"),                     # email -> attachment -> file analyzer
    ("sms", "web"),                         # smishing -> fake site
]


def _risky(records):
    return [r for r in records if r.get("classification") not in ("safe", None)]


def link_attack_chains(all_records, seed, n_chains=200):
    rng = make_rng(seed, "attack_chains")
    stats = {"chains_created": 0, "records_tagged": 0, "by_pattern": {}}
    for c in range(1, n_chains + 1):
        pattern = CHAIN_PATTERNS[c % len(CHAIN_PATTERNS)]
        if any(p not in all_records or not _risky(all_records[p]) for p in pattern):
            continue
        chain_id = gen_id("CHAIN", c)
        user_pool_candidates = _risky(all_records[pattern[0]])
        if not user_pool_candidates:
            continue
        anchor_user = rng.choice(user_pool_candidates)["user_id"]
        tagged_here = 0
        for step, platform in enumerate(pattern, start=1):
            candidates = [r for r in _risky(all_records[platform]) if r.get("attack_chain_id") is None]
            if not candidates:
                continue
            same_user = [r for r in candidates if r.get("user_id") == anchor_user]
            rec = rng.choice(same_user) if same_user else rng.choice(candidates)
            rec["attack_chain_id"] = chain_id
            rec["chain_step"] = step
            rec["chain_pattern"] = " -> ".join(pattern)
            tagged_here += 1
        if tagged_here >= 2:
            stats["chains_created"] += 1
            stats["records_tagged"] += tagged_here
            key = " -> ".join(pattern)
            stats["by_pattern"][key] = stats["by_pattern"].get(key, 0) + 1
    return stats
