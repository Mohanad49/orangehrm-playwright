#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:8090}"
API="$BASE/installer/index.php/installer/api"
JAR=$(mktemp)
post() { curl -sf -b "$JAR" -c "$JAR" -H 'Content-Type: application/json' -X POST -d "$2" "$API$1"; }

echo "  -> database-config"
post /database-config '{"dbHost":"db","dbPort":"3306","dbName":"orangehrm","dbUser":"root","dbPassword":"rootpw","useSameUserForOrangeHRM":true,"enableDataEncryption":false}' >/dev/null
echo "  -> instance"
post /instance '{"organizationName":"OrangeHRM","countryCode":"US","langCode":"en_US","timezone":"UTC"}' >/dev/null
echo "  -> admin-user"
post /admin-user '{"firstName":"OrangeHRM","lastName":"Admin","email":"admin@example.com","contact":"","username":"Admin","password":"Ohrm@1423","consent":false}' >/dev/null
echo "  -> installation/database"
post /installation/database '{}' >/dev/null
echo "  -> installation/pre-migration"
post /installation/pre-migration '{}' >/dev/null

echo "  -> migrations (one call per version, as the wizard does)"
VERSIONS=$(curl -sf "$API/versions" | python3 -c 'import json,sys; print(" ".join(json.load(sys.stdin)))')
for v in $VERSIONS; do
  post /installation/migration "{\"version\":\"$v\"}" >/dev/null || { echo "     migration $v FAILED"; exit 1; }
done
echo "     applied: $(echo "$VERSIONS" | wc -w | tr -d ' ') versions"

echo "  -> installation/instance"
post /installation/instance '{}' >/dev/null
echo "  -> installation/database-user"
post /installation/database-user '{}' >/dev/null
echo "  -> config-file"
post /installation/config-file '{"registrationConsent":false}' >/dev/null
echo "  -> clean-up-install"
post /clean-up-install '{}' >/dev/null 2>&1 || true
