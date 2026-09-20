@echo off
title C-Studio - Compilador e Playground C
cd /d "%~dp0"

echo ======================================================
echo          C-STUDIO - COMPILADOR E PLAYGROUND C
echo ======================================================
echo.
echo [1/2] Abrindo interface no navegador padrao...
start http://localhost:3000
echo.
echo [2/2] Iniciando servidor de compilacao em C...
node server.js
pause
