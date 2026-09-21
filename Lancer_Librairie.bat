@echo off
title Lancement - Lumina Librairie et Papeterie
cls
echo =====================================================================
echo  LUMINA LIBRAIRIE & PAPETERIE SCOLAIRE - LANCEUR RAPIDE
echo =====================================================================
echo.
echo  [1] Ouvrir l'Espace Administrateur (Gestion, Livres, Commandes, Stats)
echo  [2] Ouvrir la Boutique en Ligne (Vitrine Publique)
echo  [3] Ouvrir les deux dans votre navigateur
echo.
set /p choix="Faites votre choix (1, 2 ou 3) puis appuyez sur Entree : "

if "%choix%"=="1" (
    echo Ouverture de l'Administration...
    start "" "%~dp0admin.html"
) else if "%choix%"=="2" (
    echo Ouverture de la Boutique...
    start "" "%~dp0index.html"
) else if "%choix%"=="3" (
    echo Ouverture de la Boutique et de l'Admin...
    start "" "%~dp0index.html"
    start "" "%~dp0admin.html"
) else (
    echo Choix par defaut : Ouverture de l'administration...
    start "" "%~dp0admin.html"
)

exit
