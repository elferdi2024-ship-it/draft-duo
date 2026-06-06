@echo off
title LCU Bridge - Draft Duo
echo ===================================================
echo   INICIANDO LCU BRIDGE PARA DRAFT DUO
echo ===================================================
echo Cambiando al directorio del proyecto...
d:
cd "d:\PROYECTOS\draft duo"
echo.
echo Ejecutando npm run bridge...
npm run bridge
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo un problema al iniciar el bridge.
    echo Asegurate de tener Node.js instalado y estar en el directorio correcto.
)
pause
