#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is not installed. Install it first and rerun this script."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login"
  exit 1
fi

read -r -p "Paste your Coolify Deploy Webhook URL: " webhook_url

if [[ -z "${webhook_url}" ]]; then
  echo "Webhook URL cannot be empty."
  exit 1
fi

printf "%s" "${webhook_url}" | gh secret set COOLIFY_DEPLOY_WEBHOOK_URL

echo "GitHub Actions secret COOLIFY_DEPLOY_WEBHOOK_URL has been set."
echo "Push to main (or run Deploy to Coolify manually) to trigger deployment."
