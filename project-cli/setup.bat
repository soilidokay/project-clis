@echo off
:: Check if the script is running with admin privileges
NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo This script needs to be run as Administrator.
    echo Restarting with elevated privileges...
    :: Restart the batch file with admin privileges
    powershell -Command "Start-Process cmd -ArgumentList '/c %~s0' -Verb runAs"
    exit /b
)

:: Now that we have elevated privileges, continue the script

SETLOCAL ENABLEDELAYEDEXPANSION

:: Get the current directory
SET currentDir=%CD%\bin

:: Registry path for user environment variables
SET regPath=HKCU\Environment

:: Get the current PATH variable
FOR /F "tokens=*" %%a IN ('reg query "%regPath%" /v Path 2^>nul') DO SET currentPath=%%a

:: Check if the current directory is already in PATH
echo %currentPath% | findstr /C:"%currentDir%" >nul
IF %ERRORLEVEL% EQU 0 (
    echo The current directory is already in the PATH variable.
) ELSE (
    REM Add the current directory to the PATH
    reg add "%regPath%" /v Path /t REG_EXPAND_SZ /f /d "%currentPath%;%currentDir%"
    echo The current directory has been added to the PATH variable.
)

pause
