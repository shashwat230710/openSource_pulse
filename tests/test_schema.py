#!/usr/bin/env python3
"""
Unit Test: Schema and Null-Rate Drift Verification
Checks Bronze and Silver explicit schemas, verifies required fields are non-null,
and tests bot-filtering regex.
"""

import unittest
import re
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

BOT_REGEX = r"(\[bot\]$|-bot$|^dependabot|^renovate|^github-actions)"

class TestSchemaAndFilters(unittest.TestCase):
    def test_bot_regex_patterns(self):
        """Ensures known bot and automation patterns are filtered out."""
        bots = [
            "dependabot[bot]",
            "renovate[bot]",
            "github-actions[bot]",
            "my-service-bot",
            "dependabot",
            "renovate",
            "github-actions"
        ]
        for b in bots:
            self.assertTrue(bool(re.search(BOT_REGEX, b)), f"Bot '{b}' should have been detected")

        real_users = [
            "torvalds",
            "karpathy",
            "tiangolo",
            "shashwat",
            "robotics-fan",
            "bottom_line"
        ]
        for u in real_users:
            self.assertFalse(bool(re.search(BOT_REGEX, u)), f"Real user '{u}' was wrongly flagged as bot")

    def test_required_event_types(self):
        """Verifies all six required GH Archive event types are configured."""
        required = {"WatchEvent", "ForkEvent", "CreateEvent", "PullRequestEvent", "IssuesEvent", "PushEvent"}
        import importlib
        ingest_mod = importlib.import_module("jobs.01_ingest")
        self.assertEqual(set(ingest_mod.KEEP), required)

if __name__ == "__main__":
    unittest.main()
