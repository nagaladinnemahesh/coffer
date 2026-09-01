#!/bin/sh

cat > /usr/share/nginx/html/config.js <<EOF
window.__COFFER_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

exec nginx -g "daemon off;"