:: Copyright 1998-2019 Epic Games, Inc. All Rights Reserved.
@echo off

pushd %~dp0

::call setup.bat



::Run node server


 

Set a=%1 & Set b=%2 & Set c=%3 & Set d=%4 & Set e=%5 & Set f=%6 & Set g=%7 & Set h=%8 & Set i=%9
Shift & Shift & Shift & Shift & Shift & Shift & Shift & Shift & Shift
Set j=%1 & Set k=%2 & Set l=%3 & Set m=%4 & Set n=%5 & Set o=%6 & Set p=%7 & Set q=%8 & Set r=%9
Shift & Shift & Shift & Shift & Shift & Shift & Shift & Shift & Shift
Set s=%1 & Set t=%2 & Set u=%3 & Set v=%4 & Set w=%5 & Set x=%6 & Set y=%7 & Set z=%8


REM echo  %a% 
REM echo  %b% 
REM echo  %c% 
REM echo  %d% 
REM echo  %e% 
REM echo  %f% 
REM echo  %g% 
REM echo  %h% 
REM echo  %i% 
REM echo  %j% 
REM echo  %k% 
REM echo  %l% 
REM echo  %m% 
REM echo  %n% 
REM echo  %o% 
REM echo  %p% 
REM echo  %q% 
REM echo  %r% 


set var1=pie_ms
set var2=%h% 
set var3=%j% 
set var4=%t% 
set var5=%x%

set newvar=    %var5% : %var1% : %var2% : %var3% : %var4% 

echo %newvar%

title  %newvar% 
::title Cirrus

Powershell.exe -executionpolicy unrestricted -File pie_ms.ps1  %a% %b% %c% %d% %e% %f% %g% %h%  %i% %j% %k% %l% %m% %n% %o% %p% %q% %r% %s% %t% %u% %v%  %w% %x%  %y% %z%
popd
pause
