#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Checking for forbidden server actions in src/db..."
if rg -n '^(\"use server\"|'\''use server'\'')$' src/db; then
  echo "Found forbidden \\\"use server\\\" directives in src/db." >&2
  exit 1
fi

echo "Checking client imports of internal-only modules..."
client_import_violations=""
while IFS= read -r file; do
  if matches=$(rg -n "from ['\\\"]@/(db/|lib/email/send|lib/kyc/processing|lib/rewards/processing|lib/eas/serverOnly)['\\\"]" "$file"); then
    client_import_violations+=$'--- '"$file"$'\n'"$matches"$'\n'
  fi
done < <(rg -l '^(\"use client\"|'\''use client'\'')$' src)

if [[ -n "$client_import_violations" ]]; then
  printf '%s\n' "$client_import_violations" >&2
  echo "Found client components importing internal-only server modules." >&2
  exit 1
fi

echo "Checking server action inventory..."
actual_inventory="$(mktemp)"
trap 'rm -f "$actual_inventory"' EXIT
rg -l '^(\"use server\"|'\''use server'\'')$' src | sort > "$actual_inventory"

if ! diff -u config/server-action-allowlist.txt "$actual_inventory"; then
  echo "Server action inventory changed. Review the new surface area and update config/server-action-allowlist.txt intentionally." >&2
  exit 1
fi

echo "Auth guardrails passed."
