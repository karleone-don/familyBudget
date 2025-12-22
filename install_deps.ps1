#!/usr/bin/env pwsh

Write-Host "Installing Django backend dependencies..." -ForegroundColor Green
cd "c:\Users\jahs\familyBudget\back"
python -m pip install -q Django==4.2.7 djangorestframework==3.14.0 django-cors-headers==4.3.1 djangorestframework-simplejwt==5.3.0 Pillow==10.0.1 python-decouple==3.8
Write-Host "Backend dependencies installed!" -ForegroundColor Green

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
cd "c:\Users\jahs\familyBudget\front"

# Try to download Node.js to user directory if not in PATH
$nodePath = ""
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found in PATH. Attempting to install..."
    
    # Try portable Node.js
    $nodeZip = "$env:TEMP\node-portable.zip"
    $nodeDir = "$env:USERPROFILE\.node"
    
    Write-Host "Downloading Node.js..."
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip" -OutFile $nodeZip -ErrorAction Stop
    
    Write-Host "Extracting Node.js..."
    Expand-Archive -Path $nodeZip -DestinationPath $nodeDir -Force
    
    $nodePath = "$nodeDir\node-v20.10.0-win-x64"
    $env:Path = "$nodePath;" + $env:Path
    Write-Host "Node.js installed to $nodePath" -ForegroundColor Green
}

Write-Host "Installing npm packages..."
npm install
Write-Host "Frontend dependencies installed!" -ForegroundColor Green
