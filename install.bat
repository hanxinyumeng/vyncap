@echo off
echo 正在安装 Vyncap...

:: 创建安装目录
set INSTALL_DIR=%LOCALAPPDATA%\Vyncap
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: 复制 exe
copy /Y "%~dp0vyncap.exe" "%INSTALL_DIR%\vyncap.exe"

:: 创建桌面快捷方式
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\createShortcut.vbs"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Vyncap.lnk" >> "%TEMP%\createShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\createShortcut.vbs"
echo oLink.TargetPath = "%INSTALL_DIR%\vyncap.exe" >> "%TEMP%\createShortcut.vbs"
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\createShortcut.vbs"
echo oLink.Description = "AI-powered screenshot tool" >> "%TEMP%\createShortcut.vbs"
echo oLink.Save >> "%TEMP%\createShortcut.vbs"
cscript /nologo "%TEMP%\createShortcut.vbs"
del "%TEMP%\createShortcut.vbs"

:: 创建开始菜单快捷方式
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Vyncap
if not exist "%START_MENU%" mkdir "%START_MENU%"
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\createStartMenu.vbs"
echo sLinkFile = "%START_MENU%\Vyncap.lnk" >> "%TEMP%\createStartMenu.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\createStartMenu.vbs"
echo oLink.TargetPath = "%INSTALL_DIR%\vyncap.exe" >> "%TEMP%\createStartMenu.vbs"
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\createStartMenu.vbs"
echo oLink.Description = "AI-powered screenshot tool" >> "%TEMP%\createStartMenu.vbs"
echo oLink.Save >> "%TEMP%\createStartMenu.vbs"
cscript /nologo "%TEMP%\createStartMenu.vbs"
del "%TEMP%\createStartMenu.vbs"

echo 安装完成！
echo 桌面和开始菜单已创建快捷方式。
pause
