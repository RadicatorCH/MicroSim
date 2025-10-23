# Modulare Wirtschaftssimulation

Eine vollständige, objektorientierte Python-Wirtschaftssimulation mit Supply Chains, Produktion, Konsum, Banken und Fiskalpolitik.

## Übersicht

Dieses Projekt implementiert eine modulare Wirtschaftssimulation mit folgenden Hauptkomponenten:

### Klassen

#### 1. **PersonNode**
Repräsentiert eine Person mit wirtschaftlichen Attributen:
- Attribute: Name, Alter, Bildung, Einkommen, Gesundheit, Konsumpräferenzen, Region, Arbeitgeber
- Methoden: 
  - `set_region()`: Setzt die Region der Person
  - `set_arbeitgeber()`: Setzt den Arbeitgeber
  - `arbeitsproduktivitaet()`: Berechnet Produktivität aus Bildung und Gesundheit
  - `konsum_tick()`: Berechnet Konsum basierend auf Warenkorb und Einkommen
  - `tick()`: Führt einen Simulationstick aus (Alterung, Gesundheitsänderungen)

#### 2. **Produkt**
Definiert ein Produkt mit Supply Chain:
- Attribute: Name, Basispreis, Vorprodukte (Dict), Maschinenbedarf
- Vorprodukte ermöglichen mehrstufige Produktionsketten (z.B. Weizen → Mehl → Brot)

#### 3. **Warenkorb**
Repräsentativer Konsumwarenkorb:
- Methoden:
  - `add_produkt()`: Fügt Produkt mit Gewichtung hinzu
  - `anteil()`: Berechnet Anteil eines Produkts im Warenkorb

#### 4. **Maschine**
Produktionsmaschine:
- Attribute: Name, Kosten, Lebensdauer, Produktionsfaktor, produzierte Produkte
- Methoden:
  - `kann_herstellen()`: Prüft, ob Produkt herstellbar ist
  - `abschreibung_pro_tick()`: Berechnet Abschreibung
  - `tick()`: Altert die Maschine

#### 5. **UnternehmenNode**
Unternehmen mit vollständiger Produktionslogik:
- Attribute: Name, Region, Maschinen, Mitarbeiter, Konto, Kredite, Lager, Produkte
- Methoden:
  - `produzieren()`: Produziert basierend auf Warenkorb-Nachfrage unter Berücksichtigung von:
    - Vorprodukten (Supply Chain)
    - Mitarbeiterqualität
    - Maschinenfaktor
  - `zahle_loehne()`: Zahlt Löhne an Mitarbeiter
  - `berechne_abschreibungen()`: Berechnet Maschinenabschreibungen
  - `berechne_gewinn()`: Gewinnberechnung

#### 6. **RegionNode**
Region mit Ressourcen und Bevölkerung:
- Attribute: Name, Bildung, Rohstoffe, Unternehmen, Bevölkerung
- Methoden:
  - `stelle_rohstoffe_bereit()`: Stellt Rohstoffe für Produktion bereit
  - `durchschnittliche_mitarbeiterqualitaet()`: Berechnet regionale Arbeitsqualität
  - `migration()`: Migration zwischen Regionen

#### 7. **NationNode**
Nation mit mehreren Regionen:
- Methoden:
  - `humankapitaltransfer()`: Transferiert Arbeitskräfte zwischen Regionen
  - `rohstoffverteilung()`: Verteilt Rohstoffe zwischen Regionen

#### 8. **BankNode**
Bank mit Kreditvergabe:
- Attribute: Eigenkapital, Kredite, Zinssatz, Zentralbank
- Methoden:
  - `kreditvergabe()`: Vergibt Kredite basierend auf Kreditwürdigkeit
  - `zinsabwicklung()`: Wickelt Zinszahlungen ab

#### 9. **ZentralbankNode**
Zentralbank mit Geldpolitik:
- Attribute: Basiszins, Geldmenge
- Methoden:
  - `registriere_bank()`: Registriert Geschäftsbanken
  - `geldpolitik_tick()`: Passt Basiszins an (simulierte Geldpolitik)

#### 10. **StaatNode**
Staat mit Fiskalpolitik:
- Attribute: Steuersatz, Subventionen, Steuereinnahmen
- Methoden:
  - `besteuere()`: Besteuert Unternehmensgewinne
  - `subventioniere()`: Zahlt Subventionen an Unternehmen

### Tick Engine

Die **SimulationEngine** führt die Simulation in zeitlichen Ticks aus:

**Reihenfolge pro Tick:**
1. **Produktion**: Unternehmen produzieren basierend auf Warenkorb-Nachfrage
   - Vorprodukte werden verbraucht
   - Endprodukte werden dem Lager hinzugefügt
2. **Konsum**: Bevölkerung konsumiert basierend auf Einkommen und Warenkorb
   - Lagerbestände werden reduziert
   - Unternehmen generieren Umsatz
3. **Fiskalpolitik**: Staat besteuert Gewinne und zahlt Subventionen
4. **Humankapitaltransfer / Migration**: Menschen migrieren zwischen Regionen
5. **Banken**: Kreditvergabe und Zinsabwicklung
6. **Zentralbanken**: Geldpolitik (Basiszinsanpassung)

### Features

✅ **Supply Chains**: Mehrstufige Produktionsketten (Rohstoffe → Vorprodukte → Endprodukte)
✅ **Lagerhaltung**: Dynamische Lagerbestände für alle Produkte
✅ **Produktionsplanung**: Basierend auf Warenkorb-Nachfrage
✅ **Maschinenbedarf**: Produktion erfordert spezifische Maschinen
✅ **Mitarbeiterqualität**: Beeinflusst Produktionseffizienz
✅ **Fiskalpolitik**: Steuern und Subventionen
✅ **Geldpolitik**: Zentralbank steuert Basiszins
✅ **Migration**: Humankapitaltransfer zwischen Regionen
✅ **Modular & skalierbar**: Einfach erweiterbar für globale Wirtschaftssimulation

## Installation und Ausführung

### Voraussetzungen
- Python 3.8 oder höher
- Keine externen Abhängigkeiten erforderlich (verwendet nur Python-Standardbibliothek)

### Ausführung

```bash
python economic_simulation.py
```

Das Skript ist vollständig selbstständig lauffähig und enthält ein komplettes Beispiel-Setup.

## Beispiel-Setup

Das mitgelieferte Beispiel enthält:

### Nationen und Regionen
- **Deutschland** mit 2 Regionen:
  - Bayern (10 Personen, 2 Unternehmen)
  - Norddeutschland (5 Personen, 1 Unternehmen)
- **Österreich** mit 1 Region:
  - Wien (5 Personen, 1 Unternehmen)

### Unternehmen und Supply Chain
1. **Mühle Bayern**: Verarbeitet Weizen zu Mehl
2. **Bäckerei Bayern**: Verarbeitet Mehl zu Brot
3. **Mühle Nord**: Verarbeitet Weizen zu Mehl
4. **Bäckerei Wien**: Verarbeitet Mehl zu Brot

### Produkte (Supply Chain)
- **Weizen** (Rohstoff) → **Mehl** (Vorprodukt) → **Brot** (Endprodukt)

### Maschinen
- **Mühle**: Produziert Mehl aus Weizen (Produktionsfaktor 1.4-1.5)
- **Backofen**: Produziert Brot aus Mehl (Produktionsfaktor 1.3-1.4)

### Warenkorb
- Brot: 1.0 Gewichtung
- Mehl: 0.3 Gewichtung

### Finanzwesen
- **EZB** (Europäische Zentralbank): Basiszins 3%, Geldmenge 1.000.000€
- **Deutsche Bank**: Eigenkapital 50.000€
- **Erste Bank**: Eigenkapital 40.000€

### Staaten
- **Deutschland**: 25% Steuersatz, Subventionen für Mühle und Bäckerei Bayern
- **Österreich**: 23% Steuersatz, Subventionen für Bäckerei Wien

## Ausgabe

Die Simulation gibt für jeden Tick aus:

1. **Produktion**: Produzierte Mengen pro Unternehmen und Produkttyp
2. **Lagerstände**: Aktueller Lagerbestand nach Produktion
3. **Konsum**: Gesamtkonsum der Bevölkerung pro Produkt
4. **Fiskalpolitik**: Steuereinnahmen und Subventionen
5. **Lohnzahlungen**: Gezahlte Löhne und Abschreibungen pro Unternehmen
6. **Migration**: Humankapitaltransfer zwischen Regionen
7. **Banken**: Eigenkapital und Zinssätze
8. **Zentralbanken**: Basiszins und Geldmenge
9. **Zusammenfassung**: Vollständiger Status aller Entitäten

### Beispiel-Ausgabe (Tick 1)

```
================================================================================
TICK 1
================================================================================

--- 1. PRODUKTION ---
Mühle Bayern: {'Mehl': 40.45}
  Lagerstand: {'Weizen': 139.32, 'Mehl': 40.45}
Bäckerei Bayern: {'Brot': 94.39}
  Lagerstand: {'Mehl': 5.61, 'Brot': 94.39}

--- 2. KONSUM ---
Gesamtkonsum: {'Brot': 3678.20, 'Mehl': 1103.46}

--- 3. FISKALPOLITIK ---
Staat(Deutschland, Steuersatz: 25.0%, Einnahmen: -267.94€)
Staat(Österreich, Steuersatz: 23.0%, Einnahmen: 92.58€)
```

## Erweiterungsmöglichkeiten

Das System ist modular aufgebaut und kann einfach erweitert werden:

- **Mehr Produkte**: Komplexere Supply Chains mit mehr Produktionsstufen
- **Internationale Handelsströme**: Handel zwischen Nationen
- **Technologischer Fortschritt**: Bessere Maschinen, höhere Produktionsfaktoren
- **Arbeitsmarkt**: Dynamische Lohnverhandlungen, Arbeitslosigkeit
- **Preisbildung**: Angebot und Nachfrage bestimmen Preise
- **Investitionen**: Unternehmen kaufen neue Maschinen
- **Bildungssystem**: Verbesserung der Mitarbeiterqualität über Zeit
- **Gesundheitssystem**: Beeinflusst Gesundheit und Produktivität
- **Finanzmärkte**: Aktienhandel, Unternehmensfinanzierung

## Architektur

Das Projekt folgt objektorientierten Prinzipien:

- **Klare Trennung**: Jede Klasse hat eine spezifische Verantwortung
- **Komposition**: Objekte enthalten andere Objekte (z.B. Region enthält Unternehmen)
- **Tick-basiert**: Alle Entitäten haben eine `tick()`-Methode für zeitliche Simulation
- **Datenstrukturen**: Verwendet Python-Dictionaries für flexible Verwaltung von Lagern, Rohstoffen, etc.

## Lizenz

Dieses Projekt ist Open Source und für Bildungszwecke verfügbar.
