param(
  [string]$PythonCommand = 'python',
  [Parameter(Mandatory = $true)]
  [string]$RuntimeRoot,
  [Parameter(Mandatory = $true)]
  [string]$RequirementsPath,
  [switch]$ForceRecreate
)

$ErrorActionPreference = 'Stop'

$resolvedRuntimeRoot = [System.IO.Path]::GetFullPath($RuntimeRoot)
$resolvedRequirementsPath = [System.IO.Path]::GetFullPath($RequirementsPath)
$venvPython = Join-Path $resolvedRuntimeRoot 'Scripts\python.exe'

if (-not (Test-Path $resolvedRequirementsPath)) {
  throw "requirements.txt not found: $resolvedRequirementsPath"
}

if ($ForceRecreate -and (Test-Path $resolvedRuntimeRoot)) {
  Remove-Item -Path $resolvedRuntimeRoot -Recurse -Force
}

if (-not (Test-Path $venvPython)) {
  New-Item -ItemType Directory -Path (Split-Path $resolvedRuntimeRoot) -Force | Out-Null
  & $PythonCommand -m venv $resolvedRuntimeRoot
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create virtual environment with $PythonCommand"
  }
}

& $venvPython -m pip install --disable-pip-version-check --upgrade pip setuptools wheel
if ($LASTEXITCODE -ne 0) {
  throw 'Failed to bootstrap pip/setuptools/wheel in the managed runtime'
}

& $venvPython -m pip install --disable-pip-version-check -r $resolvedRequirementsPath
if ($LASTEXITCODE -ne 0) {
  throw "Failed to install runtime dependencies from $resolvedRequirementsPath"
}

$pythonVersion = & $venvPython --version
Write-Output "Managed runtime ready: $venvPython"
Write-Output $pythonVersion
