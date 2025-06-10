@echo off
SET batchDir=%~dp0
REM Check if a parameter was provided
IF "%1"=="" (
    echo Please provide the command (lib, react, or reactlib)
    @REM exit /b
)

REM Call the Node.js script located in ../src/ directory with the provided parameter
call node "%batchDir%..\src\%1.js" %*
