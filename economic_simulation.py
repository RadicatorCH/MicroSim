"""
Modulare Wirtschaftssimulation (Modular Economic Simulation)

Ein vollständiges, objektorientiertes Python-Projekt für eine modulare Wirtschaftssimulation
mit Personen, Unternehmen, Regionen, Nationen, Banken, Zentralbanken und Staat.

Features:
- Supply Chains mit Vorprodukten
- Konsum → Nachfrage → Produktionsplanung → Maschinenbedarf
- Tick-basierte Simulation
- Modular und skalierbar
"""

import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict


# ============================================================================
# KLASSEN
# ============================================================================

class Produkt:
    """
    Repräsentiert ein Produkt mit Namen, Basispreis, Vorprodukten und Maschinenbedarf.
    """
    def __init__(self, name: str, basispreis: float, vorprodukte: Dict[str, float] = None, 
                 maschinenbedarf: str = None):
        self.name = name
        self.basispreis = basispreis
        self.vorprodukte = vorprodukte or {}  # Dict: Produktname → Menge
        self.maschinenbedarf = maschinenbedarf  # Name der benötigten Maschine
    
    def __repr__(self):
        return f"Produkt({self.name}, {self.basispreis}€, Vorprodukte: {self.vorprodukte})"


class Warenkorb:
    """
    Repräsentativer Warenkorb mit Produkten und ihren Gewichtungen.
    """
    def __init__(self, name: str = "Standard-Warenkorb"):
        self.name = name
        self.produkte: Dict[str, float] = {}  # Produktname → Gewichtung
    
    def add_produkt(self, produktname: str, gewichtung: float):
        """Fügt ein Produkt mit Gewichtung hinzu."""
        self.produkte[produktname] = gewichtung
    
    def anteil(self, produktname: str) -> float:
        """Gibt den Anteil eines Produkts im Warenkorb zurück."""
        total = sum(self.produkte.values())
        if total == 0:
            return 0
        return self.produkte.get(produktname, 0) / total
    
    def __repr__(self):
        return f"Warenkorb({self.name}, Produkte: {self.produkte})"


class Maschine:
    """
    Repräsentiert eine Produktionsmaschine mit Kosten, Lebensdauer und Produktionsfaktor.
    """
    def __init__(self, name: str, kosten: float, lebensdauer: int, 
                 produktionsfaktor: float, produziert: List[str]):
        self.name = name
        self.kosten = kosten
        self.lebensdauer = lebensdauer  # in Ticks
        self.produktionsfaktor = produktionsfaktor
        self.produziert = produziert  # Liste der Produktnamen
        self.alter = 0  # Aktuelles Alter in Ticks
    
    def kann_herstellen(self, produktname: str) -> bool:
        """Prüft, ob die Maschine das Produkt herstellen kann."""
        return produktname in self.produziert
    
    def abschreibung_pro_tick(self) -> float:
        """Berechnet die Abschreibung pro Tick."""
        if self.lebensdauer > 0:
            return self.kosten / self.lebensdauer
        return 0
    
    def tick(self):
        """Altert die Maschine um einen Tick."""
        self.alter += 1
    
    def __repr__(self):
        return f"Maschine({self.name}, Faktor: {self.produktionsfaktor}, Produziert: {self.produziert})"


class PersonNode:
    """
    Repräsentiert eine Person mit wirtschaftlichen Attributen.
    """
    def __init__(self, name: str, alter: int, bildung: float, einkommen: float, 
                 gesundheit: float, konsumpraeferenzen: Dict[str, float] = None):
        self.name = name
        self.alter = alter
        self.bildung = bildung  # 0-100
        self.einkommen = einkommen
        self.gesundheit = gesundheit  # 0-100
        self.konsumpraeferenzen = konsumpraeferenzen or {}
        self.region: Optional['RegionNode'] = None
        self.arbeitgeber: Optional['UnternehmenNode'] = None
    
    def set_region(self, region: 'RegionNode'):
        """Setzt die Region der Person."""
        self.region = region
    
    def set_arbeitgeber(self, arbeitgeber: 'UnternehmenNode'):
        """Setzt den Arbeitgeber der Person."""
        self.arbeitgeber = arbeitgeber
    
    def arbeitsproduktivitaet(self) -> float:
        """Berechnet die Arbeitsproduktivität basierend auf Bildung und Gesundheit."""
        return (self.bildung / 100) * (self.gesundheit / 100) * 1.5
    
    def konsum_tick(self, warenkorb: Warenkorb, verfuegbares_einkommen: float) -> Dict[str, float]:
        """
        Berechnet den Konsum für einen Tick basierend auf Warenkorb und Einkommen.
        Gibt Dictionary zurück: Produktname → konsumierte Menge
        """
        konsum = {}
        for produktname, gewichtung in warenkorb.produkte.items():
            anteil = warenkorb.anteil(produktname)
            budget_fuer_produkt = verfuegbares_einkommen * anteil
            # Vereinfachte Berechnung: Budget / Basispreis (würde in Realität dynamisch sein)
            konsum[produktname] = budget_fuer_produkt / 10  # Annahme: Durchschnittspreis ~10
        return konsum
    
    def tick(self):
        """Führt einen Tick für die Person aus."""
        # Alterung und leichte Gesundheitsveränderungen
        self.gesundheit = max(0, min(100, self.gesundheit + random.uniform(-1, 1)))
    
    def __repr__(self):
        return f"Person({self.name}, Alter: {self.alter}, Bildung: {self.bildung:.1f}, Einkommen: {self.einkommen:.2f}€)"


class UnternehmenNode:
    """
    Repräsentiert ein Unternehmen mit Produktion, Mitarbeitern und Finanzen.
    """
    def __init__(self, name: str, region: 'RegionNode'):
        self.name = name
        self.region = region
        self.maschinen: List[Maschine] = []
        self.mitarbeiter: List[PersonNode] = []
        self.konto: float = 10000.0  # Startkapital
        self.kredite: List[Tuple[float, float]] = []  # [(Betrag, Zinssatz)]
        self.lager: Dict[str, float] = defaultdict(float)  # Produktname → Menge
        self.produkte: List[Produkt] = []
        self.produktionsplan: Dict[str, float] = {}  # Produktname → geplante Menge
    
    def add_maschine(self, maschine: Maschine):
        """Fügt eine Maschine hinzu."""
        self.maschinen.append(maschine)
    
    def add_mitarbeiter(self, person: PersonNode):
        """Fügt einen Mitarbeiter hinzu."""
        self.mitarbeiter.append(person)
        person.set_arbeitgeber(self)
    
    def add_produkt(self, produkt: Produkt):
        """Fügt ein produzierbares Produkt hinzu."""
        self.produkte.append(produkt)
    
    def durchschnittliche_mitarbeiterqualitaet(self) -> float:
        """Berechnet die durchschnittliche Mitarbeiterqualität."""
        if not self.mitarbeiter:
            return 0.5
        return sum(m.arbeitsproduktivitaet() for m in self.mitarbeiter) / len(self.mitarbeiter)
    
    def kann_produzieren(self, produkt: Produkt, menge: float) -> bool:
        """Prüft, ob genug Vorprodukte und Maschinen vorhanden sind."""
        # Prüfe Vorprodukte
        for vorprodukt_name, benoetigte_menge in produkt.vorprodukte.items():
            if self.lager[vorprodukt_name] < benoetigte_menge * menge:
                return False
        
        # Prüfe Maschinen
        if produkt.maschinenbedarf:
            hat_maschine = any(m.kann_herstellen(produkt.name) for m in self.maschinen)
            if not hat_maschine:
                return False
        
        return True
    
    def produzieren(self, warenkorb: Warenkorb, nachfrage_faktor: float = 1.0):
        """
        Produziert basierend auf Warenkorb-Nachfrage.
        Berücksichtigt Vorprodukte, Mitarbeiterqualität und Maschinenfaktor.
        """
        produktionsergebnis = {}
        
        for produkt in self.produkte:
            # Bestimme Produktionsmenge basierend auf Warenkorb
            nachfrage_anteil = warenkorb.anteil(produkt.name)
            basis_menge = nachfrage_anteil * 100 * nachfrage_faktor
            
            if basis_menge <= 0:
                continue
            
            # Finde passende Maschine
            maschine = next((m for m in self.maschinen if m.kann_herstellen(produkt.name)), None)
            maschinen_faktor = maschine.produktionsfaktor if maschine else 0.5
            
            # Berechne tatsächliche Produktionsmenge
            mitarbeiter_qualitaet = self.durchschnittliche_mitarbeiterqualitaet()
            produzierte_menge = basis_menge * maschinen_faktor * mitarbeiter_qualitaet
            
            # Prüfe Vorprodukte
            if produkt.vorprodukte:
                # Reduziere Produktion, wenn nicht genug Vorprodukte
                for vorprodukt_name, benoetigte_menge_pro_einheit in produkt.vorprodukte.items():
                    benoetigte_gesamtmenge = produzierte_menge * benoetigte_menge_pro_einheit
                    verfuegbar = self.lager[vorprodukt_name]
                    
                    if verfuegbar < benoetigte_gesamtmenge:
                        # Reduziere Produktion proportional
                        reduzierungsfaktor = verfuegbar / benoetigte_gesamtmenge if benoetigte_gesamtmenge > 0 else 0
                        produzierte_menge *= reduzierungsfaktor
                
                # Verbrauche Vorprodukte
                for vorprodukt_name, benoetigte_menge_pro_einheit in produkt.vorprodukte.items():
                    verbrauch = produzierte_menge * benoetigte_menge_pro_einheit
                    self.lager[vorprodukt_name] -= verbrauch
            
            # Füge Produktion zum Lager hinzu
            self.lager[produkt.name] += produzierte_menge
            produktionsergebnis[produkt.name] = produzierte_menge
        
        return produktionsergebnis
    
    def zahle_loehne(self):
        """Zahlt Löhne an alle Mitarbeiter."""
        gesamtloehne = 0
        for mitarbeiter in self.mitarbeiter:
            gesamtloehne += mitarbeiter.einkommen
        
        self.konto -= gesamtloehne
        return gesamtloehne
    
    def berechne_abschreibungen(self) -> float:
        """Berechnet Gesamtabschreibungen für alle Maschinen."""
        return sum(m.abschreibung_pro_tick() for m in self.maschinen)
    
    def berechne_gewinn(self, umsatz: float, kosten: float) -> float:
        """Berechnet den Gewinn."""
        return umsatz - kosten
    
    def tick(self):
        """Führt einen Tick für das Unternehmen aus."""
        # Maschinen altern
        for maschine in self.maschinen:
            maschine.tick()
    
    def __repr__(self):
        return f"Unternehmen({self.name}, Mitarbeiter: {len(self.mitarbeiter)}, Konto: {self.konto:.2f}€)"


class RegionNode:
    """
    Repräsentiert eine Region mit Bildung, Rohstoffen, Unternehmen und Bevölkerung.
    """
    def __init__(self, name: str, bildung: float):
        self.name = name
        self.bildung = bildung  # Durchschnittliche Bildung 0-100
        self.rohstoffe: Dict[str, float] = {}  # Rohstoffname → Menge
        self.unternehmen: List[UnternehmenNode] = []
        self.bevoelkerung: List[PersonNode] = []
    
    def add_unternehmen(self, unternehmen: UnternehmenNode):
        """Fügt ein Unternehmen hinzu."""
        self.unternehmen.append(unternehmen)
    
    def add_person(self, person: PersonNode):
        """Fügt eine Person zur Bevölkerung hinzu."""
        self.bevoelkerung.append(person)
        person.set_region(self)
    
    def add_rohstoff(self, name: str, menge: float):
        """Fügt einen Rohstoff hinzu."""
        self.rohstoffe[name] = menge
    
    def stelle_rohstoffe_bereit(self, rohstoff: str, menge: float) -> float:
        """
        Stellt Rohstoffe bereit. Gibt die tatsächlich bereitgestellte Menge zurück.
        """
        verfuegbar = self.rohstoffe.get(rohstoff, 0)
        bereitgestellt = min(verfuegbar, menge)
        self.rohstoffe[rohstoff] = verfuegbar - bereitgestellt
        return bereitgestellt
    
    def durchschnittliche_mitarbeiterqualitaet(self) -> float:
        """Berechnet die durchschnittliche Mitarbeiterqualität in der Region."""
        if not self.bevoelkerung:
            return 0.5
        return sum(p.arbeitsproduktivitaet() for p in self.bevoelkerung) / len(self.bevoelkerung)
    
    def migration(self, ziel_region: 'RegionNode', anzahl: int):
        """Migriert Personen in eine andere Region."""
        if anzahl > len(self.bevoelkerung):
            anzahl = len(self.bevoelkerung)
        
        for _ in range(anzahl):
            if self.bevoelkerung:
                person = self.bevoelkerung.pop()
                ziel_region.add_person(person)
    
    def __repr__(self):
        return f"Region({self.name}, Bevölkerung: {len(self.bevoelkerung)}, Unternehmen: {len(self.unternehmen)})"


class NationNode:
    """
    Repräsentiert eine Nation mit mehreren Regionen.
    """
    def __init__(self, name: str):
        self.name = name
        self.regionen: List[RegionNode] = []
    
    def add_region(self, region: RegionNode):
        """Fügt eine Region hinzu."""
        self.regionen.append(region)
    
    def humankapitaltransfer(self, von_region: str, zu_region: str, anzahl: int):
        """Transferiert Humankapital zwischen Regionen."""
        von = next((r for r in self.regionen if r.name == von_region), None)
        zu = next((r for r in self.regionen if r.name == zu_region), None)
        
        if von and zu:
            von.migration(zu, anzahl)
    
    def rohstoffverteilung(self, rohstoff: str, von_region: str, zu_region: str, menge: float):
        """Verteilt Rohstoffe zwischen Regionen."""
        von = next((r for r in self.regionen if r.name == von_region), None)
        zu = next((r for r in self.regionen if r.name == zu_region), None)
        
        if von and zu:
            bereitgestellt = von.stelle_rohstoffe_bereit(rohstoff, menge)
            if zu_region not in zu.rohstoffe:
                zu.rohstoffe[rohstoff] = 0
            zu.rohstoffe[rohstoff] += bereitgestellt
    
    def __repr__(self):
        return f"Nation({self.name}, Regionen: {len(self.regionen)})"


class BankNode:
    """
    Repräsentiert eine Bank mit Eigenkapital, Krediten und Zinssatz.
    """
    def __init__(self, name: str, eigenkapital: float, zinssatz: float):
        self.name = name
        self.eigenkapital = eigenkapital
        self.zinssatz = zinssatz
        self.kredite: Dict[str, List[Tuple[float, float]]] = defaultdict(list)  # Kreditnehmer → [(Betrag, Zinssatz)]
        self.zentralbank: Optional['ZentralbankNode'] = None
    
    def set_zentralbank(self, zentralbank: 'ZentralbankNode'):
        """Setzt die Zentralbank."""
        self.zentralbank = zentralbank
    
    def kreditvergabe(self, kreditnehmer: str, betrag: float, kreditwuerdigkeit: float) -> bool:
        """
        Vergibt einen Kredit, wenn Kreditwürdigkeit ausreichend ist.
        """
        if kreditwuerdigkeit < 0.5:
            return False
        
        if self.eigenkapital >= betrag * 0.1:  # 10% Eigenkapitalanforderung
            self.kredite[kreditnehmer].append((betrag, self.zinssatz))
            self.eigenkapital -= betrag
            return True
        return False
    
    def zinsabwicklung(self):
        """Wickelt Zinszahlungen für alle Kredite ab."""
        gesamtzinsen = 0
        for kreditnehmer, kreditliste in self.kredite.items():
            for betrag, zinssatz in kreditliste:
                zinsen = betrag * zinssatz
                gesamtzinsen += zinsen
        
        self.eigenkapital += gesamtzinsen
        return gesamtzinsen
    
    def tick(self):
        """Führt einen Tick für die Bank aus."""
        self.zinsabwicklung()
    
    def __repr__(self):
        return f"Bank({self.name}, Eigenkapital: {self.eigenkapital:.2f}€, Zinssatz: {self.zinssatz:.2%})"


class ZentralbankNode:
    """
    Repräsentiert eine Zentralbank mit Basiszins und Geldmenge.
    """
    def __init__(self, name: str, basiszins: float, geldmenge: float):
        self.name = name
        self.basiszins = basiszins
        self.geldmenge = geldmenge
        self.banken: List[BankNode] = []
    
    def registriere_bank(self, bank: BankNode):
        """Registriert eine Bank bei der Zentralbank."""
        self.banken.append(bank)
        bank.set_zentralbank(self)
    
    def geldpolitik_tick(self):
        """Führt Geldpolitik-Maßnahmen durch."""
        # Einfache Geldpolitik: Leichte Anpassung des Basiszinses
        inflation_signal = random.uniform(-0.001, 0.001)
        self.basiszins = max(0, min(0.1, self.basiszins + inflation_signal))
        
        # Aktualisiere Zinssätze der Banken
        for bank in self.banken:
            bank.zinssatz = self.basiszins + 0.02  # 2% Aufschlag
    
    def tick(self):
        """Führt einen Tick für die Zentralbank aus."""
        self.geldpolitik_tick()
    
    def __repr__(self):
        return f"Zentralbank({self.name}, Basiszins: {self.basiszins:.2%}, Geldmenge: {self.geldmenge:.2f})"


class StaatNode:
    """
    Repräsentiert einen Staat mit Steuersatz und Subventionen.
    """
    def __init__(self, name: str, steuersatz: float):
        self.name = name
        self.steuersatz = steuersatz  # z.B. 0.25 für 25%
        self.subventionen: Dict[str, float] = {}  # Unternehmen → Subventionsbetrag
        self.steuereinnahmen: float = 0
    
    def add_subvention(self, unternehmen_name: str, betrag: float):
        """Fügt eine Subvention für ein Unternehmen hinzu."""
        self.subventionen[unternehmen_name] = betrag
    
    def besteuere(self, unternehmen: UnternehmenNode, gewinn: float) -> float:
        """Besteuert ein Unternehmen und gibt den Steuerbetrag zurück."""
        if gewinn > 0:
            steuern = gewinn * self.steuersatz
            unternehmen.konto -= steuern
            self.steuereinnahmen += steuern
            return steuern
        return 0
    
    def subventioniere(self, unternehmen: UnternehmenNode) -> float:
        """Zahlt Subventionen an ein Unternehmen."""
        betrag = self.subventionen.get(unternehmen.name, 0)
        if betrag > 0:
            unternehmen.konto += betrag
            self.steuereinnahmen -= betrag
        return betrag
    
    def tick(self, unternehmen_liste: List[UnternehmenNode]):
        """Führt einen Tick für den Staat aus: Besteuerung und Subventionierung."""
        for unternehmen in unternehmen_liste:
            # Vereinfachte Gewinnberechnung
            gewinn = unternehmen.konto * 0.05  # Annahme: 5% des Kontos als Gewinn
            self.besteuere(unternehmen, gewinn)
            self.subventioniere(unternehmen)
    
    def __repr__(self):
        return f"Staat({self.name}, Steuersatz: {self.steuersatz:.1%}, Einnahmen: {self.steuereinnahmen:.2f}€)"


# ============================================================================
# TICK ENGINE
# ============================================================================

class SimulationEngine:
    """
    Führt die Wirtschaftssimulation in Ticks aus.
    """
    def __init__(self):
        self.nationen: List[NationNode] = []
        self.banken: List[BankNode] = []
        self.zentralbanken: List[ZentralbankNode] = []
        self.staaten: List[StaatNode] = []
        self.warenkorb: Optional[Warenkorb] = None
        self.tick_count = 0
    
    def add_nation(self, nation: NationNode):
        """Fügt eine Nation zur Simulation hinzu."""
        self.nationen.append(nation)
    
    def add_bank(self, bank: BankNode):
        """Fügt eine Bank zur Simulation hinzu."""
        self.banken.append(bank)
    
    def add_zentralbank(self, zentralbank: ZentralbankNode):
        """Fügt eine Zentralbank zur Simulation hinzu."""
        self.zentralbanken.append(zentralbank)
    
    def add_staat(self, staat: StaatNode):
        """Fügt einen Staat zur Simulation hinzu."""
        self.staaten.append(staat)
    
    def set_warenkorb(self, warenkorb: Warenkorb):
        """Setzt den repräsentativen Warenkorb."""
        self.warenkorb = warenkorb
    
    def run_tick(self):
        """
        Führt einen einzelnen Tick der Simulation aus.
        
        Reihenfolge:
        1. Produktion (Vorprodukte → Endprodukte)
        2. Konsum der Bevölkerung
        3. Fiskalpolitik (Steuern & Subventionen)
        4. Humankapitaltransfer / Migration
        5. Banken: Kredite, Zinsen
        6. Zentralbanken: Geldpolitik
        """
        self.tick_count += 1
        print(f"\n{'='*80}")
        print(f"TICK {self.tick_count}")
        print(f"{'='*80}")
        
        # 1. PRODUKTION
        print("\n--- 1. PRODUKTION ---")
        alle_unternehmen = []
        for nation in self.nationen:
            for region in nation.regionen:
                for unternehmen in region.unternehmen:
                    alle_unternehmen.append(unternehmen)
        
        for unternehmen in alle_unternehmen:
            if self.warenkorb:
                produktionsergebnis = unternehmen.produzieren(self.warenkorb, nachfrage_faktor=1.0)
                if produktionsergebnis:
                    print(f"{unternehmen.name}: {produktionsergebnis}")
                    print(f"  Lagerstand: {dict(unternehmen.lager)}")
        
        # 2. KONSUM
        print("\n--- 2. KONSUM ---")
        gesamtkonsum = defaultdict(float)
        for nation in self.nationen:
            for region in nation.regionen:
                for person in region.bevoelkerung:
                    konsum = person.konsum_tick(self.warenkorb, person.einkommen * 0.8)
                    for produkt, menge in konsum.items():
                        gesamtkonsum[produkt] += menge
        
        print(f"Gesamtkonsum: {dict(gesamtkonsum)}")
        
        # Reduziere Lager durch Konsum
        for unternehmen in alle_unternehmen:
            for produkt, nachfrage in gesamtkonsum.items():
                if produkt in unternehmen.lager:
                    anteil = 1.0 / len(alle_unternehmen)  # Gleichmäßige Verteilung
                    verkauft = min(unternehmen.lager[produkt], nachfrage * anteil)
                    unternehmen.lager[produkt] -= verkauft
                    # Umsatz (vereinfacht)
                    umsatz = verkauft * 10  # Annahme: Preis ~10€
                    unternehmen.konto += umsatz
        
        # 3. FISKALPOLITIK
        print("\n--- 3. FISKALPOLITIK ---")
        for staat in self.staaten:
            staat.tick(alle_unternehmen)
            print(f"{staat}")
        
        # Lohnzahlungen
        print("\n--- LOHNZAHLUNGEN ---")
        for unternehmen in alle_unternehmen:
            loehne = unternehmen.zahle_loehne()
            abschreibungen = unternehmen.berechne_abschreibungen()
            print(f"{unternehmen.name}: Löhne: {loehne:.2f}€, Abschreibungen: {abschreibungen:.2f}€")
        
        # 4. HUMANKAPITALTRANSFER / MIGRATION
        print("\n--- 4. HUMANKAPITALTRANSFER / MIGRATION ---")
        # Vereinfachte Migration (optional)
        for nation in self.nationen:
            if len(nation.regionen) >= 2 and random.random() < 0.1:
                # 10% Chance für Migration
                von_region = random.choice(nation.regionen)
                zu_region = random.choice([r for r in nation.regionen if r != von_region])
                if len(von_region.bevoelkerung) > 5:
                    nation.humankapitaltransfer(von_region.name, zu_region.name, 1)
                    print(f"Migration: 1 Person von {von_region.name} nach {zu_region.name}")
        
        # 5. BANKEN
        print("\n--- 5. BANKEN: KREDITE & ZINSEN ---")
        for bank in self.banken:
            bank.tick()
            print(f"{bank}")
        
        # 6. ZENTRALBANKEN
        print("\n--- 6. ZENTRALBANKEN: GELDPOLITIK ---")
        for zentralbank in self.zentralbanken:
            zentralbank.tick()
            print(f"{zentralbank}")
        
        # Tick für alle Entitäten
        for unternehmen in alle_unternehmen:
            unternehmen.tick()
        
        for nation in self.nationen:
            for region in nation.regionen:
                for person in region.bevoelkerung:
                    person.tick()
        
        # ZUSAMMENFASSUNG
        print("\n--- ZUSAMMENFASSUNG ---")
        for nation in self.nationen:
            print(f"\n{nation}")
            for region in nation.regionen:
                print(f"  {region}")
                for unternehmen in region.unternehmen:
                    print(f"    {unternehmen}")
                    print(f"      Lager: {dict(unternehmen.lager)}")
    
    def run_simulation(self, ticks: int):
        """Führt die Simulation für eine bestimmte Anzahl von Ticks aus."""
        print(f"\n{'#'*80}")
        print(f"STARTE WIRTSCHAFTSSIMULATION FÜR {ticks} TICKS")
        print(f"{'#'*80}")
        
        for _ in range(ticks):
            self.run_tick()
        
        print(f"\n{'#'*80}")
        print(f"SIMULATION ABGESCHLOSSEN NACH {self.tick_count} TICKS")
        print(f"{'#'*80}")


# ============================================================================
# BEISPIEL-SETUP UND SIMULATION
# ============================================================================

def erstelle_beispiel_simulation():
    """
    Erstellt ein vollständiges Beispiel-Setup für die Wirtschaftssimulation.
    """
    print("Erstelle Beispiel-Simulation...")
    
    # ========== PRODUKTE ==========
    print("- Erstelle Produkte...")
    weizen = Produkt("Weizen", 2.0, vorprodukte={}, maschinenbedarf=None)  # Rohstoff
    mehl = Produkt("Mehl", 3.0, vorprodukte={"Weizen": 1.5}, maschinenbedarf="Mühle")
    brot = Produkt("Brot", 5.0, vorprodukte={"Mehl": 1.0}, maschinenbedarf="Backofen")
    
    # ========== WARENKORB ==========
    print("- Erstelle Warenkorb...")
    warenkorb = Warenkorb("Standard-Warenkorb")
    warenkorb.add_produkt("Brot", 1.0)
    warenkorb.add_produkt("Mehl", 0.3)
    
    # ========== MASCHINEN ==========
    print("- Erstelle Maschinen...")
    muehle = Maschine("Mühle", 5000, 100, 1.5, ["Mehl"])
    backofen = Maschine("Backofen", 8000, 120, 1.3, ["Brot"])
    
    # ========== NATIONEN UND REGIONEN ==========
    print("- Erstelle Nationen und Regionen...")
    
    # Nation 1: Deutschland
    deutschland = NationNode("Deutschland")
    
    # Region 1.1: Bayern
    bayern = RegionNode("Bayern", bildung=75.0)
    bayern.add_rohstoff("Weizen", 1000.0)
    
    # Region 1.2: Norddeutschland
    norddeutschland = RegionNode("Norddeutschland", bildung=70.0)
    norddeutschland.add_rohstoff("Weizen", 800.0)
    
    deutschland.add_region(bayern)
    deutschland.add_region(norddeutschland)
    
    # Nation 2: Österreich
    oesterreich = NationNode("Österreich")
    
    # Region 2.1: Wien
    wien = RegionNode("Wien", bildung=80.0)
    wien.add_rohstoff("Weizen", 500.0)
    
    oesterreich.add_region(wien)
    
    # ========== UNTERNEHMEN ==========
    print("- Erstelle Unternehmen...")
    
    # Unternehmen 1: Mühle Bayern
    muehle_bayern = UnternehmenNode("Mühle Bayern", bayern)
    muehle_bayern.add_maschine(muehle)
    muehle_bayern.add_produkt(mehl)
    muehle_bayern.lager["Weizen"] = 200.0  # Initialer Lagerbestand
    bayern.add_unternehmen(muehle_bayern)
    
    # Unternehmen 2: Bäckerei Bayern
    baeckerei_bayern = UnternehmenNode("Bäckerei Bayern", bayern)
    baeckerei_bayern.add_maschine(backofen)
    baeckerei_bayern.add_produkt(brot)
    baeckerei_bayern.lager["Mehl"] = 100.0  # Initialer Lagerbestand
    bayern.add_unternehmen(baeckerei_bayern)
    
    # Unternehmen 3: Mühle Nord
    muehle_nord = UnternehmenNode("Mühle Nord", norddeutschland)
    muehle_nord.add_maschine(Maschine("Mühle", 5000, 100, 1.4, ["Mehl"]))
    muehle_nord.add_produkt(mehl)
    muehle_nord.lager["Weizen"] = 150.0
    norddeutschland.add_unternehmen(muehle_nord)
    
    # Unternehmen 4: Bäckerei Wien
    baeckerei_wien = UnternehmenNode("Bäckerei Wien", wien)
    baeckerei_wien.add_maschine(Maschine("Backofen", 8000, 120, 1.4, ["Brot"]))
    baeckerei_wien.add_produkt(brot)
    baeckerei_wien.lager["Mehl"] = 80.0
    wien.add_unternehmen(baeckerei_wien)
    
    # ========== BEVÖLKERUNG ==========
    print("- Erstelle Bevölkerung...")
    
    # Bayern: 10 Personen
    for i in range(10):
        person = PersonNode(
            name=f"Person_BY_{i+1}",
            alter=random.randint(20, 60),
            bildung=random.uniform(60, 90),
            einkommen=random.uniform(2000, 4000),
            gesundheit=random.uniform(70, 100),
            konsumpraeferenzen={"Brot": 0.7, "Mehl": 0.3}
        )
        bayern.add_person(person)
        
        # Weise einige Personen Unternehmen zu
        if i < 3:
            muehle_bayern.add_mitarbeiter(person)
        elif i < 6:
            baeckerei_bayern.add_mitarbeiter(person)
    
    # Norddeutschland: 5 Personen
    for i in range(5):
        person = PersonNode(
            name=f"Person_ND_{i+1}",
            alter=random.randint(20, 60),
            bildung=random.uniform(55, 85),
            einkommen=random.uniform(1800, 3500),
            gesundheit=random.uniform(70, 100),
            konsumpraeferenzen={"Brot": 0.6, "Mehl": 0.4}
        )
        norddeutschland.add_person(person)
        
        if i < 2:
            muehle_nord.add_mitarbeiter(person)
    
    # Wien: 5 Personen
    for i in range(5):
        person = PersonNode(
            name=f"Person_W_{i+1}",
            alter=random.randint(20, 60),
            bildung=random.uniform(65, 95),
            einkommen=random.uniform(2200, 4200),
            gesundheit=random.uniform(75, 100),
            konsumpraeferenzen={"Brot": 0.8, "Mehl": 0.2}
        )
        wien.add_person(person)
        
        if i < 2:
            baeckerei_wien.add_mitarbeiter(person)
    
    # ========== BANKEN & ZENTRALBANKEN ==========
    print("- Erstelle Banken und Zentralbanken...")
    
    # Zentralbank EZB
    ezb = ZentralbankNode("EZB", basiszins=0.03, geldmenge=1000000)
    
    # Banken
    deutsche_bank = BankNode("Deutsche Bank", eigenkapital=50000, zinssatz=0.05)
    oesterreichische_bank = BankNode("Erste Bank", eigenkapital=40000, zinssatz=0.05)
    
    ezb.registriere_bank(deutsche_bank)
    ezb.registriere_bank(oesterreichische_bank)
    
    # ========== STAAT ==========
    print("- Erstelle Staaten...")
    
    staat_deutschland = StaatNode("Deutschland", steuersatz=0.25)
    staat_deutschland.add_subvention("Mühle Bayern", 500.0)
    staat_deutschland.add_subvention("Bäckerei Bayern", 300.0)
    
    staat_oesterreich = StaatNode("Österreich", steuersatz=0.23)
    staat_oesterreich.add_subvention("Bäckerei Wien", 400.0)
    
    # ========== SIMULATION ENGINE ==========
    print("- Erstelle Simulation Engine...")
    
    engine = SimulationEngine()
    engine.add_nation(deutschland)
    engine.add_nation(oesterreich)
    engine.add_bank(deutsche_bank)
    engine.add_bank(oesterreichische_bank)
    engine.add_zentralbank(ezb)
    engine.add_staat(staat_deutschland)
    engine.add_staat(staat_oesterreich)
    engine.set_warenkorb(warenkorb)
    
    return engine


# ============================================================================
# MAIN
# ============================================================================

def main():
    """
    Hauptfunktion: Erstellt und führt die Beispiel-Simulation aus.
    """
    print("\n" + "="*80)
    print("MODULARE WIRTSCHAFTSSIMULATION")
    print("="*80 + "\n")
    
    # Erstelle Simulation
    engine = erstelle_beispiel_simulation()
    
    # Führe Simulation für 5 Ticks aus
    engine.run_simulation(ticks=5)
    
    print("\n" + "="*80)
    print("SIMULATION ERFOLGREICH ABGESCHLOSSEN!")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
