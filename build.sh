#!/usr/bin/env bash
# Script de build para Render.com
# Instala FFmpeg (necesario para convertir audio a MP3) y las dependencias de Python

set -o errexit

apt-get update
apt-get install -y ffmpeg

pip install -r requirements.txt
