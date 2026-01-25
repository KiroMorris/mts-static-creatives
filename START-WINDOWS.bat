@echo off
title Apparel Creative Generator
color 0A

echo.
echo  ==================================================
echo       MTS STATIC CREATIVE STUDIO  v1.18
echo       By Kiro Morris - myturtle.store
echo  ==================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ================================================
    echo    STEP 0: INSTALL NODE.JS (Required^)
    echo  ================================================
    echo.
    echo  Node.js is not installed on your computer.
    echo  This is required to run the app.
    echo.
    echo  HOW TO INSTALL:
    echo  ------------------------------------------------
    echo  1. Open this link in your browser:
    echo.
    echo     ^>^>^> https://nodejs.org/
    echo.
    echo  2. Click the big green 'LTS' button
    echo  3. Open the downloaded file
    echo  4. Follow the installer (just click Next^)
    echo  5. Once installed, run this script again!
    echo.
    echo  ================================================
    echo.
    pause
    exit
)

echo  [OK] Node.js found!
echo.

:: Check if .env.local exists
if not exist ".env.local" (
    echo  ================================================
    echo    FIRST TIME SETUP - API KEY REQUIRED
    echo  ================================================
    echo.
    echo  You need a Google Gemini API key to generate images.
    echo  Follow these 3 steps:
    echo.
    echo  ------------------------------------------------
    echo  STEP 1: Get a payment card (required by Google^)
    echo  ------------------------------------------------
    echo  Google requires a card to use the API.
    echo  Don't have a card? Get a virtual Mastercard:
    echo.
    echo  ^>^>^> https://app.card-y.com/register?code=JAGB-JSUL-VAMP
    echo.
    echo  ------------------------------------------------
    echo  STEP 2: Set up Google Cloud Billing
    echo  ------------------------------------------------
    echo  1. Go to: https://console.cloud.google.com/
    echo  2. Sign in with your Google account
    echo  3. Click the menu (top-left^) -^> Billing
    echo  4. Add your card details
    echo.
    echo  ------------------------------------------------
    echo  STEP 3: Get your FREE API Key
    echo  ------------------------------------------------
    echo  1. Go to: https://aistudio.google.com/apikey
    echo  2. Click 'Create API Key'
    echo  3. Click 'Create API key in new project'
    echo  4. Copy the key (starts with AIza...^)
    echo.
    echo  ================================================
    echo.
    set /p apikey="  Paste your API Key here: "

    if "%apikey%"=="" (
        echo.
        echo  [ERROR] No API key entered. Please run this script again.
        echo.
        pause
        exit
    )

    echo GOOGLE_AI_API_KEY=%apikey%> .env.local
    echo.
    echo  [OK] API Key saved!
    echo.
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo  ================================================
    echo    INSTALLING DEPENDENCIES
    echo  ================================================
    echo.
    echo  This may take 2-5 minutes on first run...
    echo.
    call npm install
    echo.
    echo  [OK] Dependencies installed!
    echo.
)

echo  ================================================
echo    STARTING THE APP...
echo  ================================================
echo.
echo  Once you see 'Ready', open your browser to:
echo.
echo  ^>^>^> http://localhost:3000
echo.
echo  To stop the app, press Ctrl+C
echo  ================================================
echo.

:: Start the dev server
npm run dev

pause
