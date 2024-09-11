# Define paths
$localSoftwareFolder = ".\Installation_Softwares\"
$nodeInstaller = "node-v20.17.0-x64.msi"

# Install Node.js
Write-Output "Installing Node.js..."
Start-Process msiexec.exe -ArgumentList "/i `"$localSoftwareFolder\$nodeInstaller`" /quiet /norestart" -Wait -NoNewWindow

# Verify Node.js installation
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Output "Node.js installed successfully."
} else {
    Write-Error "Node.js installation failed."
    exit 1
}

# Navigate to the project folder


# Install project dependencies
Write-Output "Installing project dependencies..."
npm install -g

# Run the application (if needed)
Write-Output "Running the application..."
npm start

Write-Output "Installation and setup complete."
