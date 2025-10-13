$ErrorActionPreference = 'Stop'

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRoot = Resolve-Path (Join-Path $scriptDir '..')
$distPath = Join-Path $sourceRoot 'dist'
$repoRoot = Resolve-Path (Join-Path $sourceRoot '..')

if (-not (Test-Path $distPath)) {
  Write-Error "Build directory does not exist: $distPath. Please run npm run build first."
  exit 1
}

Write-Host "Deployment started: copying from $distPath to $repoRoot" -ForegroundColor Cyan

# 1) 同步 index.html 到根目录
$srcIndex = Join-Path $distPath 'index.html'
if (Test-Path $srcIndex) {
  Copy-Item $srcIndex (Join-Path $repoRoot 'index.html') -Force
  Write-Host "Root index.html overwritten"
} else {
  Write-Warning "dist/index.html not found"
}

# 2) 同步 assets 目录（先清理根目录 assets，再复制新产物）
$rootAssets = Join-Path $repoRoot 'assets'
$distAssets = Join-Path $distPath 'assets'
if (Test-Path $distAssets) {
  if (Test-Path $rootAssets) {
    Remove-Item $rootAssets -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Root assets/ cleaned"
  }
  Copy-Item $distAssets $repoRoot -Recurse -Force
  Write-Host "Assets synchronized"
}

# 3) dist 下可能还有其他文件或目录（例如 manifest、icons 等），除 index.html 与 assets 外也一起复制
Get-ChildItem $distPath | ForEach-Object {
  if ($_.Name -ieq 'index.html' -or $_.Name -ieq 'assets') { return }
  $dest = Join-Path $repoRoot $_.Name
  if ($_.PSIsContainer) {
    # 目录：覆盖复制
    if (Test-Path $dest) {
      Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue
    }
    Copy-Item $_.FullName $repoRoot -Recurse -Force
  } else {
    # 文件：直接覆盖
    Copy-Item $_.FullName $dest -Force
  }
  Write-Host ("Synchronized {0}" -f $_.Name)
}

Write-Host 'Deploy done. Preserved root sub-sites like components/' -ForegroundColor Green

# 4) 启动本地预览服务器（localhost）
try {
  $defaultPort = 5500
  function Test-PortFree([int]$p) { try { $l = New-Object System.Net.Sockets.TcpListener([ipaddress]::Loopback, $p); $l.Start(); $l.Stop(); return $true } catch { return $false } }
  $port = $defaultPort
  while (-not (Test-PortFree $port)) { $port++ }

  $serverScript = Join-Path $scriptDir 'local-server.mjs'
  if (-not (Test-Path $serverScript)) {
    Write-Warning "Local server script not found: $serverScript"
    return
  }

  Write-Host "Starting local server on http://127.0.0.1:$port ..." -ForegroundColor Cyan
  $argsList = @("$serverScript", '-r', "$repoRoot", '-H', '127.0.0.1', '-p', "$port")
  $proc = Start-Process -FilePath "node" -ArgumentList $argsList -WorkingDirectory $repoRoot -WindowStyle Normal -PassThru

  Start-Sleep -Seconds 1
  $url = "http://127.0.0.1:$port/"
  Write-Host "Opening $url" -ForegroundColor Cyan
  Start-Process $url
} catch {
  Write-Warning "Failed to start local server: $($_.Exception.Message)"
}

# 确保脚本以成功状态退出，避免 npm 认为失败
exit 0