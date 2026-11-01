$ErrorActionPreference = 'Stop'

# 保留旧入口；构建、预览现在由独立的 npm 命令控制。
& node (Join-Path $PSScriptRoot 'deploy.mjs')
exit $LASTEXITCODE
