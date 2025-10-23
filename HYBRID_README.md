# EcoSim + MicroSim Hybrid ML-System

Ein integriertes Wirtschaftssimulationssystem mit Machine Learning-Funktionalitäten, bestehend aus:

- **EcoSim Frontend** (React/TypeScript): Visueller Canvas für Wirtschaftssimulationen
- **MicroSim Backend** (Python/Flask): ML-fähige Wirtschaftssimulation mit API

## 🚀 Schnellstart

### 1. Backend starten (MicroSim)

```bash
cd MicroSim
./start_backend.sh
```

Oder manuell:
```bash
cd MicroSim
pip install -r requirements.txt
python api_server.py
```

Das Backend läuft dann auf `http://localhost:5000`

### 2. Frontend starten (EcoSim)

```bash
cd EcoSim
npm install
npm run dev
```

Das Frontend läuft dann auf `http://localhost:5173`

### 3. ML-Panel öffnen

Im EcoSim Frontend:
1. Klicke auf "🧠 ML-Panel öffnen" (oben rechts)
2. Das ML-Dashboard öffnet sich rechts
3. Starte die Simulation über die ML-Steuerung

## 🧠 ML-Funktionalitäten

### Verfügbare ML-Features:

1. **Einkommensvorhersage**
   - Input: Bildung, Gesundheit, Alter, Region-Bildung
   - Output: Vorhergesagtes Einkommen

2. **Produktivitätsvorhersage**
   - Input: Bildung, Gesundheit, Region-Bildung
   - Output: Vorhergesagte Arbeitsproduktivität

3. **Trend-Analyse**
   - Personen-Trends: Einkommen, Produktivität, Bildung, Gesundheit
   - Unternehmens-Performance: Profit, Produktivität, Mitarbeiterzahl

4. **Echtzeitdaten**
   - Automatische Datensammlung alle 5 Sekunden
   - Historische Daten für ML-Training
   - Live-Updates im Frontend

### ML-Datenstrukturen:

**Personen-Daten:**
- Alter, Bildung, Gesundheit, Einkommen
- Arbeitsproduktivität, Region-Zugehörigkeit
- Arbeitgeber-Status

**Unternehmens-Daten:**
- Mitarbeiterzahl, Maschinenzahl, Kontostand
- Durchschnittliche Mitarbeiterqualität
- Lagerbestände, Produktanzahl

**Regions-Daten:**
- Bildung, Bevölkerung, Unternehmensanzahl
- Rohstoffbestände, Durchschnittsproduktivität

## 🔧 API-Endpunkte

### Simulation Control
- `POST /api/simulation/start` - Simulation starten
- `POST /api/simulation/stop` - Simulation stoppen
- `GET /api/simulation/status` - Simulationsstatus abrufen
- `GET /api/health` - Health Check

### ML-Daten
- `GET /api/ml/data/persons` - Personen-ML-Daten
- `GET /api/ml/data/companies` - Unternehmens-ML-Daten
- `GET /api/ml/data/regions` - Regions-ML-Daten
- `GET /api/ml/features/<entity_type>` - Feature-Zusammenfassung

### ML-Vorhersagen
- `POST /api/ml/predictions/income` - Einkommensvorhersage
- `POST /api/ml/predictions/productivity` - Produktivitätsvorhersage

### Entitäten
- `GET /api/simulation/entities` - Alle aktuellen Entitäten

## 📊 Frontend-Komponenten

### MLDashboard
- **Übersicht**: Entity-Zähler, Simulationsstatus
- **ML-Vorhersagen**: Interaktive Vorhersage-Tools
- **Trends**: Zeitreihen-Analyse
- **Analyse**: Datenstatistiken

### MLControls
- Simulation starten/stoppen
- Backend-Verbindungsstatus
- Automatische Datenaktualisierung
- Entity-Übersicht

## 🏗️ Architektur

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   EcoSim        │◄─────────────────►│   MicroSim      │
│   Frontend      │                  │   Backend       │
│                 │                  │                 │
│ • React Canvas  │                  │ • Flask API     │
│ • ML Dashboard  │                  │ • ML Features   │
│ • Visualisierung│                  │ • Simulation    │
│ • Zustand       │                  │ • Datenbank     │
└─────────────────┘                  └─────────────────┘
```

## 🔄 Datenfluss

1. **MicroSim Backend** läuft kontinuierliche Wirtschaftssimulation
2. **ML-Feature Extractor** sammelt Daten aus Simulation
3. **Flask API** stellt Daten über REST-Endpunkte bereit
4. **EcoSim Frontend** ruft Daten ab und visualisiert sie
5. **ML-Modelle** machen Vorhersagen basierend auf Features
6. **Benutzer** interagiert mit ML-Tools im Frontend

## 🎯 Erweiterungsmöglichkeiten

### Geplante Features:
- **Erweiterte ML-Modelle**: TensorFlow/PyTorch Integration
- **Zeitreihen-Vorhersagen**: LSTM für Wirtschaftstrends
- **Reinforcement Learning**: Optimale Wirtschaftspolitik
- **Clustering**: Personengruppen und Unternehmenscluster
- **Anomalie-Erkennung**: Ungewöhnliche Wirtschaftsereignisse

### Neue ML-Anwendungen:
- **Kreditrisiko-Bewertung** für Banken
- **Migration-Vorhersagen** zwischen Regionen
- **Produktionsoptimierung** für Unternehmen
- **Preisvorhersagen** basierend auf Angebot/Nachfrage
- **Arbeitsmarkt-Analyse** und Lohnvorhersagen

## 🛠️ Entwicklung

### Backend erweitern:
```python
# Neue ML-Features in api_server.py hinzufügen
class MLFeatureExtractor:
    @staticmethod
    def extract_custom_features(entity):
        # Custom feature extraction logic
        pass
```

### Frontend erweitern:
```typescript
// Neue Komponenten in src/components/ hinzufügen
export const CustomMLComponent: React.FC = () => {
  // Custom ML visualization
}
```

## 📝 Lizenz

Dieses Projekt ist Open Source und für Bildungszwecke verfügbar.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

## 📞 Support

Bei Fragen oder Problemen:
- Backend-Logs: Terminal-Ausgabe des Flask-Servers
- Frontend-Logs: Browser-Entwicklertools
- API-Tests: `curl http://localhost:5000/api/health`
