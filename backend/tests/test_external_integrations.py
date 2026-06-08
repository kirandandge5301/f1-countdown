import os
import requests
import pytest


# External data providers used by frontend services
OPENF1_BASE = "https://api.openf1.org/v1"
JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"


def _public_app_url() -> str | None:
    return os.environ.get("REACT_APP_BACKEND_URL") or os.environ.get("base_url")


class TestExternalProviders:
    """Smoke checks for live providers consumed by app services."""

    def test_openf1_meetings_live(self):
        response = requests.get(f"{OPENF1_BASE}/meetings", params={"year": 2026}, timeout=20)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        first = data[0]
        assert "meeting_name" in first
        assert "date_start" in first

    def test_openf1_sessions_live(self):
        response = requests.get(f"{OPENF1_BASE}/sessions", params={"year": 2026}, timeout=20)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        sample = data[0]
        assert "meeting_key" in sample
        assert "date_start" in sample

    def test_jolpica_previous_race_results_live(self):
        response = requests.get(f"{JOLPICA_BASE}/current/last/results.json", timeout=20)
        assert response.status_code == 200
        data = response.json()
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        assert isinstance(races, list)
        assert len(races) >= 1
        race = races[0]
        assert race.get("raceName")
        assert race.get("date")


class TestPublicAppUrl:
    """Public app endpoint checks (if configured in env)."""

    def test_public_app_url_is_configured(self):
        app_url = _public_app_url()
        if not app_url:
            pytest.skip("Public app URL env missing (REACT_APP_BACKEND_URL/base_url)")
        assert app_url.startswith("http")

    def test_public_app_root_responds_without_server_error(self):
        app_url = _public_app_url()
        if not app_url:
            pytest.skip("Public app URL env missing (REACT_APP_BACKEND_URL/base_url)")

        response = requests.get(app_url.rstrip("/"), timeout=20)
        assert response.status_code < 500
