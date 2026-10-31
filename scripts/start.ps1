param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (-not $env:JAVA_HOME -and (Test-Path 'D:/software/jdk-17.0.11')) { $env:JAVA_HOME = 'D:/software/jdk-17.0.11' }
$maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if (-not $maven) { throw 'Maven 3.6.3+ is required. Add Maven bin to PATH.' }
$env:PORT = $Port
& $maven.Source '-Dmaven.repo.local=./tools/m2' spring-boot:run
exit $LASTEXITCODE
