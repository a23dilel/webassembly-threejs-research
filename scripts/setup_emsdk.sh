#!/usr/bin/env bash

# Exit when an error occur on command
set -e

# If there is no emsdk directory, then clone the Emscripten SDK
if [ ! -d "emsdk" ]; then
    git clone https://github.com/emscripten-core/emsdk.git
fi

echo "Entering the emsdk directory..."
cd emsdk

# Fetch the latest version of the emsdk
echo "Updating repository..."
git pull

# Download and install the 5.0.4 SDK tools.
echo "Installing version 5.0.4..."
./emsdk install 5.0.4

# Make the "5.0.4" SDK "active" for the current user. (writes .emscripten file)
echo "Activating version 5.0.4..."
./emsdk activate 5.0.4

echo "Done! Now run 'source ./emsdk/emsdk_env.sh' to activate the PATH and other environment variables in the current terminal."