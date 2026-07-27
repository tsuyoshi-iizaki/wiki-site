#!/bin/bash
set -euo pipefail

VAULT_DIR="$HOME/claude-obsidian/wiki"
SITE_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTENT_DIR="$SITE_DIR/content"

# Copy wiki content
rm -rf "$CONTENT_DIR"/*
for item in "$VAULT_DIR"/*.md "$VAULT_DIR"/concepts "$VAULT_DIR"/entities "$VAULT_DIR"/sources; do
  [ -e "$item" ] && cp -r "$item" "$CONTENT_DIR/"
done

echo "Copied wiki content to $CONTENT_DIR"

# Commit and push
cd "$SITE_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi
git commit -m "update: wiki content $(date +%Y-%m-%d)"
git push

echo "Pushed. GitHub Actions will build, encrypt, and deploy."
