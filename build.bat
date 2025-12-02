@echo off
REM Build script for Chrome Extension (Windows)
REM This script copies files from src/main to src/compressed, minifies them, and creates a versioned zip file

setlocal enabledelayedexpansion

REM Get script directory
set "SCRIPT_DIR=%~dp0"
set "SRC_DIR=%SCRIPT_DIR%src\main"
set "COMPRESSED_DIR=%SCRIPT_DIR%src\compressed"
set "VERSIONS_DIR=%SCRIPT_DIR%src\versions"
set "MANIFEST_PATH=%SRC_DIR%\manifest.json"

echo.
echo [INFO] Starting build process...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed. Please install npm and try again.
    exit /b 1
)

echo [SUCCESS] All dependencies are installed
echo.

REM Check if manifest.json exists
if not exist "%MANIFEST_PATH%" (
    echo [ERROR] manifest.json not found at %MANIFEST_PATH%
    exit /b 1
)

REM Read version from manifest.json
for /f "delims=" %%i in ('node -e "console.log(JSON.parse(require('fs').readFileSync('%MANIFEST_PATH%', 'utf8')).version)"') do set VERSION=%%i
echo [INFO] Building version: %VERSION%
echo.

REM Clean up compressed directory if it exists
if exist "%COMPRESSED_DIR%" (
    echo [INFO] Cleaning up old compressed directory...
    rmdir /s /q "%COMPRESSED_DIR%"
)

REM Create fresh compressed directory
mkdir "%COMPRESSED_DIR%"
echo [SUCCESS] Created compressed directory
echo.

REM Process all files
echo [INFO] Processing files...
echo.

REM Process files using PowerShell for better file handling
powershell -ExecutionPolicy Bypass -Command ^
"$srcDir = '%SRC_DIR%'; " ^
"$compDir = '%COMPRESSED_DIR%'; " ^
"Get-ChildItem -Path $srcDir -Recurse -File | ForEach-Object { " ^
"    $relativePath = $_.FullName.Substring($srcDir.Length + 1); " ^
"    $outputPath = Join-Path $compDir $relativePath; " ^
"    $outputDir = Split-Path $outputPath -Parent; " ^
"    if (!(Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }; " ^
"    $ext = $_.Extension.ToLower(); " ^
"    switch ($ext) { " ^
"        '.js' { " ^
"            $result = & npx -y terser $_.FullName -o $outputPath -c -m --comments false 2>&1; " ^
"            if ($LASTEXITCODE -eq 0) { Write-Host '[SUCCESS] Minified JS:' $_.Name -ForegroundColor Green } " ^
"            else { Write-Host '[WARNING] Failed to minify, copying original:' $_.Name -ForegroundColor Yellow; Copy-Item $_.FullName $outputPath -Force } " ^
"        } " ^
"        '.css' { " ^
"            $result = & npx -y csso-cli $_.FullName -o $outputPath 2>&1; " ^
"            if ($LASTEXITCODE -eq 0) { Write-Host '[SUCCESS] Minified CSS:' $_.Name -ForegroundColor Green } " ^
"            else { Write-Host '[WARNING] Failed to minify, copying original:' $_.Name -ForegroundColor Yellow; Copy-Item $_.FullName $outputPath -Force } " ^
"        } " ^
"        '.html' { " ^
"            $result = & npx -y html-minifier-terser --collapse-whitespace --remove-comments --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --use-short-doctype --minify-css true --minify-js true $_.FullName -o $outputPath 2>&1; " ^
"            if ($LASTEXITCODE -eq 0) { Write-Host '[SUCCESS] Minified HTML:' $_.Name -ForegroundColor Green } " ^
"            else { Write-Host '[WARNING] Failed to minify, copying original:' $_.Name -ForegroundColor Yellow; Copy-Item $_.FullName $outputPath -Force } " ^
"        } " ^
"        '.json' { " ^
"            $json = Get-Content $_.FullName -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 100; " ^
"            Set-Content -Path $outputPath -Value $json -NoNewline; " ^
"            Write-Host '[SUCCESS] Minified JSON:' $_.Name -ForegroundColor Green " ^
"        } " ^
"        default { " ^
"            Copy-Item $_.FullName $outputPath -Force; " ^
"            Write-Host '[SUCCESS] Copied:' $_.Name -ForegroundColor Green " ^
"        } " ^
"    } " ^
"}"

echo.
echo [INFO] Creating zip archive...

REM Create versions directory if it doesn't exist
if not exist "%VERSIONS_DIR%" mkdir "%VERSIONS_DIR%"

REM Create zip file
set "ZIP_FILE=%VERSIONS_DIR%\%VERSION%.zip"

REM Remove old zip if it exists
if exist "%ZIP_FILE%" del "%ZIP_FILE%"

REM Create zip using PowerShell
powershell -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%COMPRESSED_DIR%\*' -DestinationPath '%ZIP_FILE%' -CompressionLevel Optimal"

if exist "%ZIP_FILE%" (
    for %%A in ("%ZIP_FILE%") do set ZIP_SIZE=%%~zA
    set /a ZIP_SIZE_MB=!ZIP_SIZE!/1024/1024
    echo [SUCCESS] Created %VERSION%.zip ^(!ZIP_SIZE_MB! MB^)
) else (
    echo [ERROR] Failed to create zip file
    exit /b 1
)

echo.
echo [INFO] Cleaning up temporary files...
rmdir /s /q "%COMPRESSED_DIR%"
echo [SUCCESS] Cleaned up temporary files
echo.

echo [SUCCESS] Build completed successfully!
echo [SUCCESS] Output: src\versions\%VERSION%.zip
echo.

endlocal
