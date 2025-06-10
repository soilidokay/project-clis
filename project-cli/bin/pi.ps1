# Get the current script directory
$batchDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Check if a parameter was provided
if ($args.Count -eq 0) {
    Write-Host "Please provide the command (lib, react, or reactlib)"
    exit
}

# Call the Node.js script located in ../src/ directory with the provided parameter
$scriptPath = Join-Path -Path $batchDir -ChildPath "..\src\$($args[0]).js"
node $scriptPath $args
