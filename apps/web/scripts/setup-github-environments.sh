#!/usr/bin/env bash
set -euo pipefail

# Setup GitHub environments for Scalingo deployment.
# Prerequisites: gh CLI authenticated with admin access to the repo.
#
# Usage:
#   ./scripts/setup-github-environments.sh
#
# Set secrets inline:
#   SCALINGO_API_TOKEN_STAGING=sc-xxx SCALINGO_API_TOKEN_PRODUCTION=sc-yyy ./scripts/setup-github-environments.sh

REPO="roadmaps-faciles/roadmaps-faciles"

echo "=== Setting up GitHub environments for ${REPO} ==="

# ─── Staging ───
echo ""
echo "--- Creating 'staging' environment ---"
gh api --method PUT "repos/${REPO}/environments/staging" --silent
echo "  Environment 'staging' created/updated."

if [[ -n "${SCALINGO_API_TOKEN_STAGING:-}" ]]; then
  echo "  Setting SCALINGO_API_TOKEN..."
  gh secret set SCALINGO_API_TOKEN \
    --repo "${REPO}" \
    --env staging \
    --body "${SCALINGO_API_TOKEN_STAGING}"
  echo "  Done."
else
  echo "  SCALINGO_API_TOKEN_STAGING not set - skipping secret."
  echo "  Set manually: gh secret set SCALINGO_API_TOKEN --repo ${REPO} --env staging"
fi

# ─── Production ───
echo ""
echo "--- Creating 'production' environment ---"
gh api --method PUT "repos/${REPO}/environments/production" \
  --field prevent_self_review=true --silent
echo "  Environment 'production' created/updated."

if [[ -n "${SCALINGO_API_TOKEN_PRODUCTION:-}" ]]; then
  echo "  Setting SCALINGO_API_TOKEN..."
  gh secret set SCALINGO_API_TOKEN \
    --repo "${REPO}" \
    --env production \
    --body "${SCALINGO_API_TOKEN_PRODUCTION}"
  echo "  Done."
else
  echo "  SCALINGO_API_TOKEN_PRODUCTION not set - skipping secret."
  echo "  Set manually: gh secret set SCALINGO_API_TOKEN --repo ${REPO} --env production"
fi

# ─── Summary ───
echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Set secrets (if not done above):"
echo "     gh secret set SCALINGO_API_TOKEN --repo ${REPO} --env staging"
echo "     gh secret set SCALINGO_API_TOKEN --repo ${REPO} --env production"
echo "  2. Add required reviewers to 'production' in GitHub UI:"
echo "     https://github.com/${REPO}/settings/environments"
echo "  3. Optionally restrict 'production' to 'main' branch only."
