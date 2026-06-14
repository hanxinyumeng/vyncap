@echo off
echo 正在卸载 Vyncap...

:: 删除安装目录
set INSTALL_DIR=%LOCALAPPDATA%\Vyncap
if exist "%INSTALL_DIR%" rmdir /S /Q "%INSTALL_DIR%"

:: 删除桌面快捷方式
del "%USERPROFILE%\Desktop\Vyncap.lnk" 2>nul

:: 删除开始菜单快捷方式
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Vyncap
if exist "%START_MENU%" rmdir /S /Q "%START_MENU%"

echo 卸载完成！
pause
