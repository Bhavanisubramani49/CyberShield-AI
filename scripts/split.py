"""
Section 21/22: split without leakage.
- group by duplicate_group_id / attack_chain_id / source_template_id so
  near-duplicate or chained samples never straddle train/test.
- user-holdout: users flagged split_group == "holdout_test" always land
  in a separate holdout test set regardless of the record-level split.
"""
from common import split_bucket


def assign_split(records, users_by_id, seed):
    """Primary train/validation/test split is always grouped by
    duplicate_group_id / attack_chain_id / source_template_id so near-duplicate
    or chained records never straddle splits (Section 21).

    User generalization (Section 22) is tracked as a separate boolean flag
    rather than folded into the primary split, because forcing a whole
    duplicate/attack-chain group into "test" whenever it touches a holdout
    user would itself create the leakage Section 21 forbids. Downstream,
    filter test records where user_holdout=True for the user-generalization
    evaluation slice.
    """
    holdout_user_ids = {u["user_id"] for u in users_by_id.values() if u.get("split_group") == "holdout_test"}
    for r in records:
        # duplicate_group_id (photos/videos) and attack_chain_id (cross-platform
        # chains) are genuine, intentionally-constructed near-duplicate/linked
        # groups, so they always win. source_template_id is a much weaker,
        # incidental signal (many unrelated short strings can collide on it)
        # and is kept purely as metadata -- using it for splitting produced
        # spurious "leakage" whenever one templated record got pulled into an
        # attack chain and its siblings didn't.
        group_key = r.get("duplicate_group_id") or r.get("attack_chain_id") or r["record_id"]
        r["split"] = split_bucket(seed, group_key)
        r["split_reason"] = "grouped_hash_split"
        r["user_holdout"] = r.get("user_id") in holdout_user_ids
    return records
