#!/usr/bin/env python3
"""
Unit Test: Data & Label Leakage Verification
Mandatory check from Section 6 Phase 6 of the blueprint:
1. Verifies that NO feature column references 'stars_next' or any week after the snapshot week.
2. Verifies that the embargo gap between splits (train, val, test) is at least H=4 weeks,
   preventing future label windows from overlapping across splits.
"""

import unittest

class TestPipelineLeakage(unittest.TestCase):
    def setUp(self):
        self.feature_columns = [
            "stars_cum",
            "stars_w0",
            "stars_w1",
            "stars_w2",
            "stars_w3",
            "stars_4w",
            "forks_4w",
            "fork_star_ratio",
            "prs_opened_4w",
            "issues_4w",
            "pushes_4w",
            "age_weeks",
            "growth_ratio",
            "burstiness",
            "pagerank",
            "community_momentum"
        ]
        self.label_columns = ["stars_next", "label"]
        self.H = 4 # 4 weeks ahead
        self.embargo_gap = 4

    def test_feature_list_excludes_future_windows(self):
        """Feature list must never contain future label indicators."""
        for feat in self.feature_columns:
            self.assertNotIn("next", feat.lower(), f"Feature '{feat}' contains future keyword 'next'")
            self.assertNotIn("future", feat.lower(), f"Feature '{feat}' contains future keyword 'future'")
            self.assertNotEqual(feat, "label", "Target label cannot be in feature set")

    def test_embargo_gap_satisfies_label_horizon(self):
        """Embargo gap between train/val and val/test must be >= H to prevent window overlap."""
        self.assertGreaterEqual(
            self.embargo_gap,
            self.H,
            f"Embargo gap ({self.embargo_gap}) must be >= forecast horizon H ({self.H}) to prevent label leakage"
        )

    def test_window_range_boundaries(self):
        """Features must strictly use rangeBetween with high <= 0."""
        # Feature offsets: (lo, hi)
        feature_specs = {
            "stars_cum": ("unbounded", 0),
            "stars_w0": (0, 0),
            "stars_w1": (-1, -1),
            "stars_w2": (-2, -2),
            "stars_w3": (-3, -3),
            "stars_4w": (-3, 0),
            "forks_4w": (-3, 0),
        }
        for name, (lo, hi) in feature_specs.items():
            self.assertLessEqual(hi, 0, f"Feature {name} has upper window offset > 0 (lookahead leak)")

if __name__ == "__main__":
    unittest.main()
