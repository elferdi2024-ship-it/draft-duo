@echo off
title AlphaDraft Pro - Launcher
echo [Launcher] Verificando instalacion de Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor, instala Node.js antes de continuar.
    pause
    exit /b 1
)

echo [Launcher] Verificando dependencias del proyecto principal...
if not exist node_modules (
    echo [Launcher] Instalando dependencias principales...
    call npm install
)

echo [Launcher] Verificando dependencias del LCU Bridge...
if not exist bridge\node_modules (
    echo [Launcher] Instalando dependencias de LCU Bridge...
    cd bridge && call npm install && cd ..
)

echo [Launcher] Construyendo LCU Bridge...
cd bridge && call npm run build && cd ..

echo [Launcher] Iniciando LCU Bridge (en segundo plano/minimizado)...
start /min "AlphaDraft Bridge" cmd /c "cd bridge && npm run start"

echo [Launcher] Iniciando servidor de desarrollo Next.js (en segundo plano/minimizado)...
start /min "AlphaDraft Frontend" cmd /c "npm run dev"

echo [Launcher] Esperando 4 segundos para que se inicien los servicios...
timeout /t 4 /nobreak

echo [Launcher] Abriendo la aplicacion en el navegador...
start http://localhost:3000

echo [Launcher] Listo. Puedes cerrar esta ventana.
exit
