#!/bin/bash
# Script para iniciar Jenkins localmente en macOS

DIR_SERVER="/Users/sannsann/jenkins-server"
JAVA_BIN="$DIR_SERVER/jdk21/Contents/Home/bin/java"
WAR_FILE="$DIR_SERVER/jenkins.war"
JENKINS_HOME_DIR="$DIR_SERVER/jenkins_home"
PORT=8080

if [ ! -f "$JAVA_BIN" ]; then
    echo "❌ Error: No se encontró Java en $JAVA_BIN"
    exit 1
fi

if [ ! -f "$WAR_FILE" ]; then
    echo "❌ Error: No se encontró jenkins.war en $WAR_FILE"
    exit 1
fi

mkdir -p "$JENKINS_HOME_DIR"

echo "========================================================"
echo " 🚀 Iniciando Jenkins Server en macOS (Apple Silicon)"
echo " Puerto         : http://localhost:$PORT"
echo " Directorio Home: $JENKINS_HOME_DIR"
echo " Presiona Ctrl+C para detener el servidor"
echo "========================================================"

export JENKINS_HOME="$JENKINS_HOME_DIR"
exec "$JAVA_BIN" -Dmail.smtp.starttls.enable=true -jar "$WAR_FILE" --httpPort=$PORT
