#!/bin/bash

echo "[Launcher] Verificando instalación de Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado o no se encuentra en el PATH."
    exit 1
fi

echo "[Launcher] Verificando dependencias del proyecto principal..."
if [ ! -d "node_modules" ]; then
    echo "[Launcher] Instalando dependencias principales..."
    npm install
fi

echo "[Launcher] Verificando dependencias del LCU Bridge..."
if [ ! -d "bridge/node_modules" ]; then
    echo "[Launcher] Instalando dependencias de LCU Bridge..."
    (cd bridge && npm install)
fi

echo "[Launcher] Construyendo LCU Bridge..."
(cd bridge && npm run build)

echo "[Launcher] Iniciando LCU Bridge..."
cd bridge && npm run start > ../bridge.log 2>&1 &
cd ..

echo "[Launcher] Iniciando servidor de desarrollo Next.js..."
npm run dev > dev.log 2>&1 &

echo "[Launcher] Esperando 4 segundos para que se inicien los servicios..."
sleep 4

echo "[Launcher] Abriendo la aplicación en el navegador..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
else
    echo "[Launcher] Servicios listos en http://localhost:3000"
fi
