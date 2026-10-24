#!/bin/bash
# Script para detener Jenkins si está corriendo en segundo plano

PID=$(ps aux | grep "[j]enkins.war" | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "ℹ️  No hay ninguna instancia de Jenkins corriendo."
else
    echo "🛑 Deteniendo Jenkins (PID: $PID)..."
    kill -15 "$PID"
    sleep 2
    echo "✅ Jenkins detenido exitosamente."
fi
