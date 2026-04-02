:: Do not display commands in the terminal
@echo off

echo Make a build/rust directory in the project root...
mkdir build/rust

echo Compiling Rust to WebAssembly...
wasm-pack build --target web --out-dir build/rust --out-name lib --no-pack --no-typescript

:: Remove .gitignore in the build/rust directory
del build\rust\.gitignore

echo Done!