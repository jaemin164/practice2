@echo off
chcp 65001 > nul
title 당근마켓 클론

echo 백엔드 서버 시작 중...
start "백엔드" cmd /k "cd /d %~dp0backend && npm run dev"

echo 프론트엔드 서버 시작 중...
start "프론트엔드" cmd /k "cd /d %~dp0frontend && npm run dev"

echo 브라우저 여는 중...
timeout /t 4 /nobreak > nul
start http://localhost:3000

exit
