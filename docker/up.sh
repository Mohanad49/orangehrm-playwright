#!/usr/bin/env bash
#
# Bring up a fully installed, seeded OrangeHRM and leave it ready for the suite.
#
# Everything here is idempotent from the caller's point of view: it starts from
# empty containers every time, so there is no accumulated state to reason about
# and two runs of the suite cannot interfere with each other.
#
#   ./docker/up.sh [base-url]
#
set -euo pipefail

BASE_URL="${1:-http://localhost:8090}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="docker compose -f $HERE/docker-compose.yml -p orangehrm-e2e"

echo "==> Starting containers"
$COMPOSE up -d

echo "==> Waiting for the installer API"
# Poll rather than sleep. A fixed sleep is either too short, which is flaky, or
# too long, which is wasted on every single run.
for _ in $(seq 1 120); do
  if curl -sf -o /dev/null --max-time 5 "$BASE_URL/installer/index.php/installer/api/versions"; then
    break
  fi
  sleep 3
done
curl -sf -o /dev/null --max-time 10 "$BASE_URL/installer/index.php/installer/api/versions" \
  || { echo "Installer API never came up"; $COMPOSE logs --tail=50; exit 1; }

echo "==> Installing OrangeHRM"
bash "$HERE/install.sh" "$BASE_URL"

echo "==> Seeding reference data"
$COMPOSE exec -T db mysql -uroot -prootpw orangehrm < "$HERE/seed.sql"

echo "==> Verifying the instance is actually usable"
# Assert the install worked rather than assuming it did. A half-installed
# OrangeHRM still serves a login page, so "the port answers" proves nothing -
# during development an install that had written its config but created zero
# tables looked completely healthy from the outside.
TABLES=$($COMPOSE exec -T db mysql -uroot -prootpw -N -B -e \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='orangehrm';")
if [ "$TABLES" -lt 100 ]; then
  echo "Install incomplete: only $TABLES tables"; exit 1
fi

JOB_TITLES=$($COMPOSE exec -T db mysql -uroot -prootpw -N -B orangehrm -e \
  "SELECT COUNT(*) FROM ohrm_job_title;")
PERIOD=$($COMPOSE exec -T db mysql -uroot -prootpw -N -B orangehrm -e \
  "SELECT value FROM hs_hr_config WHERE name='leave_period_defined';")
if [ "$JOB_TITLES" -lt 1 ] || [ "$PERIOD" != "Yes" ]; then
  echo "Seed incomplete: job_titles=$JOB_TITLES leave_period_defined=$PERIOD"; exit 1
fi

echo "==> Ready: $TABLES tables, $JOB_TITLES job titles, leave period defined"
