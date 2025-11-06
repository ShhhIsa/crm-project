#!/usr/bin/env bash
set -e

echo "Creando Angular frontend en ./frontend ..."

# 1) Crear proyecto Angular en ./frontend usando npx (skip-git evita inicializar git dentro del frontend)
npx @angular/cli@latest new frontend --routing --style=scss --skip-git --strict --interactive=false

cd frontend

# 2) Crear proxy.conf.json para desarrollo local (proxy /api -> backend local)
cat > proxy.conf.json <<'EOF'
{
  "/api": {
    "target": "http://localhost:4000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "warn"
  }
}
EOF

# 3) Añadir environment.prod.ts con placeholder para la URL de la API
mkdir -p src/environments
cat > src/environments/environment.prod.ts <<'EOF'
export const environment = {
  production: true,
  apiUrl: 'https://REPLACE_WITH_YOUR_API_URL/api'
};
EOF

# 4) Ajustar package.json para que "start" use el proxy
node -e "
const fs=require('fs');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.start = 'ng serve --proxy-config proxy.conf.json';
pkg.scripts.build = pkg.scripts.build || 'ng build --configuration production';
fs.writeFileSync('package.json', JSON.stringify(pkg,null,2));
console.log('Updated package.json scripts');
"

# 5) Instalar dependencias (puede tardar varios minutos)
echo 'Instalando dependencias (npm ci) — esto puede tardar...'
npm ci

echo "Frontend Angular creado en ./frontend."
echo "Recuerda editar src/environments/environment.prod.ts y reemplazar REPLACE_WITH_YOUR_API_URL por la URL real de tu API."