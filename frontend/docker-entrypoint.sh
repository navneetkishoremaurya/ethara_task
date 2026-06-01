#!/usr/bin/env sh
set -eu

API_URL="${API_URL:-http://localhost:8000}"
API_PROXY_TARGET="${API_PROXY_TARGET:-}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = { API_URL: "${API_URL}" };
EOF

if [ -n "$API_PROXY_TARGET" ]; then
  cat > /etc/nginx/conf.d/default.conf <<NGINX
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass ${API_PROXY_TARGET}/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
NGINX
else
  cat > /etc/nginx/conf.d/default.conf <<'NGINX'
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
NGINX
fi
