#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT_DIR}/.env}"

generate_hex() {
  openssl rand -hex "$1"
}

generate_alnum() {
  local length="$1"
  local value=""

  while [[ "${#value}" -lt "$length" ]]; do
    value="${value}$(openssl rand -base64 "$length" | tr -dc 'A-Za-z0-9')"
  done

  printf '%s' "${value:0:length}"
}

generate_base64() {
  openssl rand -base64 "$1" | tr -d '\n'
}

load_existing_env() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
  fi
}

write_env_file() {
  local random_suffix
  random_suffix="$(generate_alnum 8 | tr '[:upper:]' '[:lower:]')"

  DB_USER="${DB_USER:-app_${random_suffix}}"
  DB_PASSWORD="${DB_PASSWORD:-$(generate_hex 24)}"
  DB_NAME="${DB_NAME:-platform_${random_suffix}}"
  TRADING_DOMAIN="${TRADING_DOMAIN:-app.localhost}"
  AFILIADOS_DOMAIN="${AFILIADOS_DOMAIN:-afiliados.localhost}"
  ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.localhost}"
  SITE_DOMAIN="${SITE_DOMAIN:-localhost}"
  SITE_NAME="${SITE_NAME:-Muniz Platform}"
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(generate_alnum 18)}"
  JWT_SECRET_KEY="${JWT_SECRET_KEY:-$(generate_base64 36)}"
  TIINGO_API_KEY="${TIINGO_API_KEY:-}"

  cat >"$ENV_FILE" <<EOF
# =====================================================================
#  Muniz Platform — Environment Variables
# =====================================================================
#  Gerado automaticamente por ./scripts/docker-up.sh
#  Edite este arquivo se quiser valores customizados.
# =====================================================================

# ---------- Database ----------
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# ---------- Domains ----------
TRADING_DOMAIN=${TRADING_DOMAIN}
AFILIADOS_DOMAIN=${AFILIADOS_DOMAIN}
ADMIN_DOMAIN=${ADMIN_DOMAIN}

# ---------- Site / Branding ----------
SITE_DOMAIN=${SITE_DOMAIN}
SITE_NAME="${SITE_NAME}"

# ---------- Admin ----------
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# ---------- Market Data ----------
TIINGO_API_KEY=${TIINGO_API_KEY}

# ---------- Auth ----------
JWT_SECRET_KEY=${JWT_SECRET_KEY}
EOF
}

main() {
  local env_only=0
  local regenerate=0
  local -a compose_args=()

  for arg in "$@"; do
    if [[ "$arg" == "--env-only" ]]; then
      env_only=1
      continue
    fi
    if [[ "$arg" == "--regenerate" ]]; then
      regenerate=1
      continue
    fi
    compose_args+=("$arg")
  done

  load_existing_env

  if [[ "$regenerate" -eq 1 ]]; then
    unset DB_USER
    unset DB_PASSWORD
    unset DB_NAME
    unset ADMIN_PASSWORD
    unset JWT_SECRET_KEY
  fi

  write_env_file

  echo "Arquivo .env pronto em ${ENV_FILE}"
  echo "Banco compartilhado: ${DB_NAME} / usuário ${DB_USER}"
  echo "Domínios: ${TRADING_DOMAIN}, ${AFILIADOS_DOMAIN}, ${ADMIN_DOMAIN}"

  if [[ "$env_only" -eq 1 ]]; then
    exit 0
  fi

  cd "$ROOT_DIR"
  docker compose up -d --build "${compose_args[@]}"
}

main "$@"
