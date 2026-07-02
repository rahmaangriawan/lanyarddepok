param(
  [string]$HostName = $env:DEPLOY_HOST,
  [string]$UserName = $env:DEPLOY_USER,
  [int]$Port = $(if ($env:DEPLOY_PORT) { [int]$env:DEPLOY_PORT } else { 22 }),
  [string]$RemotePath = $(if ($env:DEPLOY_REMOTE_PATH) { $env:DEPLOY_REMOTE_PATH } else { "htdocs/lanyardbogor.com" }),
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

if (-not $HostName) {
  throw "Missing HostName. Pass -HostName or set DEPLOY_HOST."
}

if (-not $UserName) {
  throw "Missing UserName. Pass -UserName or set DEPLOY_USER."
}

function Run-Step {
  param(
    [string]$Title,
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host "=== $Title ==="
  & $Command
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$scratchDir = Join-Path $root "scratch\deploy-local"
$archivePath = Join-Path $root "scratch\deploy-local.zip"
$standaloneDir = Join-Path $root ".next\standalone"
$nextStaticDir = Join-Path $root ".next\static"
$publicDir = Join-Path $root "public"
$restartScript = Join-Path $root "restart.sh"

Set-Location $root

if (-not $SkipBuild) {
  Run-Step "Generate Prisma client" {
    pnpm exec prisma generate
  }

  Run-Step "Build Next.js locally" {
    pnpm build
  }
}

if (-not (Test-Path $standaloneDir)) {
  throw "Missing .next\standalone. Run pnpm build first."
}

Run-Step "Prepare standalone archive" {
  if (Test-Path $scratchDir) {
    Remove-Item -LiteralPath $scratchDir -Recurse -Force
  }

  if (Test-Path $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
  }

  New-Item -ItemType Directory -Path $scratchDir | Out-Null
  Copy-Item -Path (Join-Path $standaloneDir "*") -Destination $scratchDir -Recurse -Force

  if (Test-Path $publicDir) {
    Copy-Item -Path $publicDir -Destination (Join-Path $scratchDir "public") -Recurse -Force
  }

  New-Item -ItemType Directory -Path (Join-Path $scratchDir ".next") -Force | Out-Null
  Copy-Item -Path $nextStaticDir -Destination (Join-Path $scratchDir ".next\static") -Recurse -Force

  if (Test-Path $restartScript) {
    Copy-Item -Path $restartScript -Destination (Join-Path $scratchDir "restart.sh") -Force
  }

  Compress-Archive -Path (Join-Path $scratchDir "*") -DestinationPath $archivePath -Force
}

$remote = "$UserName@$HostName"
$remoteArchive = "deploy-local.zip"

Run-Step "Upload archive to server" {
  scp -P $Port $archivePath "${remote}:$remoteArchive"
}

$remoteCommand = @"
set -e
cd "$RemotePath"
unzip -oq "$HOME/$remoteArchive"
rm -f "$HOME/$remoteArchive"
chmod +x restart.sh 2>/dev/null || true
./restart.sh
"@

Run-Step "Extract and restart on server" {
  ssh -p $Port $remote $remoteCommand
}

Write-Host ""
Write-Host "Local deploy finished."
