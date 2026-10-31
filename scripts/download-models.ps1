$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$static = Join-Path $root 'src/main/resources/static'
$models = Join-Path $static 'models'
$vendor = Join-Path $static 'vendor'
New-Item -ItemType Directory -Force -Path $models, $vendor | Out-Null
$base = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15'
$files = @('tiny_face_detector_model-weights_manifest.json', 'tiny_face_detector_model.bin', 'face_landmark_68_model-weights_manifest.json', 'face_landmark_68_model.bin', 'face_recognition_model-weights_manifest.json', 'face_recognition_model.bin')
foreach ($file in $files) {
    $target = Join-Path $models $file
    if (!(Test-Path -LiteralPath $target) -or (Get-Item -LiteralPath $target).Length -eq 0) {
        Write-Host "Downloading $file"
        Invoke-WebRequest -UseBasicParsing -Uri "$base/model/$file" -OutFile "$target.part"
        Move-Item -LiteralPath "$target.part" -Destination $target -Force
    }
}
Invoke-WebRequest -UseBasicParsing -Uri "$base/dist/face-api.js" -OutFile (Join-Path $vendor 'face-api.js')
Invoke-WebRequest -UseBasicParsing -Uri "$base/LICENSE" -OutFile (Join-Path $vendor 'FACE-API-LICENSE.txt')
Write-Host 'Face recognition assets installed. Restart Spring Boot to copy assets into the classpath.'
