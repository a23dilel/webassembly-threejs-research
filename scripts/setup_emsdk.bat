:: Do not display commands in the terminal
@echo off

:: If there is no emsdk directory, then clone the Emscripten SDK
if not exist emsdk (
    git clone https://github.com/emscripten-core/emsdk.git
)

echo Entering the emsdk directory...
cd emsdk

:: Fetch the latest version of the emsdk
echo Updating repository...
git pull

:: Download and install the 5.0.4 SDK tools.
echo Installing version 5.0.4...
call emsdk.bat install 5.0.4

:: Make the "5.0.4" SDK "active" for the current user. (writes .emscripten file)
echo Activating version 5.0.4...
call emsdk.bat activate 5.0.4

echo Go back to the root directory...
cd ..

echo Done! Now run 'call emsdk\emsdk_env.bat' to activate the PATH and other environment variables in the current terminal.