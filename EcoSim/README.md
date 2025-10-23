# EcoSim - Wirtschaftssimulation

Ein n8n-ähnliches Canvas-System für Wirtschaftssimulationen im Stil von "Die Siedler".

## Features

- **Visueller Canvas**: Drag & Drop Interface ähnlich n8n
- **Verschiedene Node-Typen**:
  - **Ressourcen**: Holz, Stein, Eisen, Nahrung, Gold
  - **Produktion**: Sägewerk, Schmiede, Bäckerei, etc.
  - **Lager**: Allgemeine und spezialisierte Lager
  - **Transport**: Straße, Wasser, Schiene
- **Echtzeit-Simulation**: Wirtschaftsprozesse laufen in Echtzeit ab
- **Verbindungen**: Nodes können miteinander verbunden werden
- **Eigenschaften-Panel**: Detaillierte Konfiguration jedes Nodes
- **Simulationssteuerung**: Start, Pause, Stop mit Geschwindigkeitskontrolle

## Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build
```

## Verwendung

1. **Nodes hinzufügen**: Verwende die Toolbar links oben, um verschiedene Node-Typen hinzuzufügen
2. **Verbindungen erstellen**: Ziehe von einem Node zu einem anderen, um Verbindungen zu erstellen
3. **Eigenschaften bearbeiten**: Klicke auf einen Node und bearbeite seine Eigenschaften im rechten Panel
4. **Simulation starten**: Verwende die Steuerung unten links, um die Simulation zu starten

## Node-Typen

### Ressourcen
- Produzieren kontinuierlich Rohstoffe
- Haben eine maximale Kapazität
- Können mit Produktionsstätten verbunden werden

### Produktion
- Verarbeiten Eingangsressourcen zu Ausgangsressourcen
- Haben eine Effizienz und Produktionsrate
- Benötigen Eingangsressourcen und produzieren Ausgangsressourcen

### Lager
- Speichern verschiedene Ressourcen
- Haben eine Gesamtkapazität
- Können als Zwischenlager oder Endlager dienen

### Transport
- Transportieren Ressourcen zwischen Nodes
- Haben verschiedene Geschwindigkeiten und Kosten
- Können Straßen-, Wasser- oder Schienenverbindungen darstellen

## Technologie-Stack

- **React 18** mit TypeScript
- **ReactFlow** für das Canvas-System
- **Zustand** für State Management
- **Vite** als Build-Tool
- **Lucide React** für Icons

## Entwicklung

Das Projekt ist modular aufgebaut:
- `src/nodes/` - Verschiedene Node-Komponenten
- `src/components/` - UI-Komponenten (Toolbar, Properties Panel, etc.)
- `src/stores/` - Zustandsmanagement
- `src/App.tsx` - Hauptanwendung

## Erweiterungen

Das System ist erweiterbar:
- Neue Node-Typen können einfach hinzugefügt werden
- Simulation-Logik kann komplexer gestaltet werden
- Weitere Ressourcentypen und Produktionsketten sind möglich
- Multiplayer-Funktionalität könnte implementiert werden
