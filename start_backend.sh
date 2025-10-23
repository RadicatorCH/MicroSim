#!/bin/bash

# MicroSim Backend Start Script
# Startet den Flask API Server für ML-Integration

echo "🚀 Starte MicroSim Backend..."
echo "📊 ML-API Server wird initialisiert..."

# Prüfe ob Python verfügbar ist
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 ist nicht installiert!"
    exit 1
fi

# Prüfe ob pip verfügbar ist
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 ist nicht installiert!"
    exit 1
fi

# Installiere Abhängigkeiten falls requirements.txt existiert
if [ -f "requirements.txt" ]; then
    echo "📦 Installiere Python-Abhängigkeiten..."
    pip3 install -r requirements.txt
fi

# Starte den API Server
echo "🌐 Starte Flask API Server auf Port 5000..."
echo "📖 API verfügbar unter: http://localhost:5000"
echo "🔗 EcoSim Frontend kann sich jetzt verbinden"
echo ""
echo "Drücke Ctrl+C zum Beenden"
echo ""

python3 api_server.py
