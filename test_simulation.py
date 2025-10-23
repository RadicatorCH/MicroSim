"""
Test suite for the economic simulation to verify all functionality.
"""

from economic_simulation import (
    Produkt, Warenkorb, Maschine, PersonNode, UnternehmenNode,
    RegionNode, NationNode, BankNode, ZentralbankNode, StaatNode,
    SimulationEngine
)


def test_produkt():
    """Test Produkt class"""
    print("Testing Produkt class...")
    weizen = Produkt("Weizen", 2.0)
    mehl = Produkt("Mehl", 3.0, vorprodukte={"Weizen": 1.5}, maschinenbedarf="Mühle")
    
    assert weizen.name == "Weizen"
    assert weizen.basispreis == 2.0
    assert len(weizen.vorprodukte) == 0
    
    assert mehl.name == "Mehl"
    assert mehl.basispreis == 3.0
    assert mehl.vorprodukte["Weizen"] == 1.5
    assert mehl.maschinenbedarf == "Mühle"
    print("✓ Produkt tests passed")


def test_warenkorb():
    """Test Warenkorb class"""
    print("Testing Warenkorb class...")
    warenkorb = Warenkorb("Test-Warenkorb")
    warenkorb.add_produkt("Brot", 1.0)
    warenkorb.add_produkt("Mehl", 0.5)
    
    assert warenkorb.name == "Test-Warenkorb"
    assert warenkorb.anteil("Brot") == 1.0 / 1.5
    assert warenkorb.anteil("Mehl") == 0.5 / 1.5
    print("✓ Warenkorb tests passed")


def test_maschine():
    """Test Maschine class"""
    print("Testing Maschine class...")
    muehle = Maschine("Mühle", 5000, 100, 1.5, ["Mehl"])
    
    assert muehle.name == "Mühle"
    assert muehle.kann_herstellen("Mehl") == True
    assert muehle.kann_herstellen("Brot") == False
    assert muehle.abschreibung_pro_tick() == 50.0
    assert muehle.alter == 0
    
    muehle.tick()
    assert muehle.alter == 1
    print("✓ Maschine tests passed")


def test_person():
    """Test PersonNode class"""
    print("Testing PersonNode class...")
    person = PersonNode("Max", 30, 75.0, 3000.0, 90.0)
    
    assert person.name == "Max"
    assert person.alter == 30
    assert person.bildung == 75.0
    assert person.einkommen == 3000.0
    
    produktivitaet = person.arbeitsproduktivitaet()
    assert produktivitaet > 0
    assert produktivitaet <= 1.5
    
    gesundheit_vorher = person.gesundheit
    person.tick()
    # Gesundheit sollte sich leicht ändern
    assert abs(person.gesundheit - gesundheit_vorher) <= 1.0
    print("✓ PersonNode tests passed")


def test_unternehmen():
    """Test UnternehmenNode class"""
    print("Testing UnternehmenNode class...")
    region = RegionNode("Test-Region", 70.0)
    unternehmen = UnternehmenNode("Test-Firma", region)
    
    assert unternehmen.name == "Test-Firma"
    assert unternehmen.konto == 10000.0
    
    # Test Maschine hinzufügen
    muehle = Maschine("Mühle", 5000, 100, 1.5, ["Mehl"])
    unternehmen.add_maschine(muehle)
    assert len(unternehmen.maschinen) == 1
    
    # Test Produkt hinzufügen
    mehl = Produkt("Mehl", 3.0, vorprodukte={"Weizen": 1.5}, maschinenbedarf="Mühle")
    unternehmen.add_produkt(mehl)
    assert len(unternehmen.produkte) == 1
    
    # Test Mitarbeiter
    person = PersonNode("Test-Person", 30, 75.0, 3000.0, 90.0)
    unternehmen.add_mitarbeiter(person)
    assert len(unternehmen.mitarbeiter) == 1
    assert person.arbeitgeber == unternehmen
    
    qualitaet = unternehmen.durchschnittliche_mitarbeiterqualitaet()
    assert qualitaet > 0
    print("✓ UnternehmenNode tests passed")


def test_region():
    """Test RegionNode class"""
    print("Testing RegionNode class...")
    region = RegionNode("Bayern", 75.0)
    
    assert region.name == "Bayern"
    assert region.bildung == 75.0
    
    # Test Rohstoffe
    region.add_rohstoff("Weizen", 1000.0)
    assert region.rohstoffe["Weizen"] == 1000.0
    
    bereitgestellt = region.stelle_rohstoffe_bereit("Weizen", 100.0)
    assert bereitgestellt == 100.0
    assert region.rohstoffe["Weizen"] == 900.0
    
    # Test Person hinzufügen
    person = PersonNode("Test-Person", 30, 75.0, 3000.0, 90.0)
    region.add_person(person)
    assert len(region.bevoelkerung) == 1
    assert person.region == region
    print("✓ RegionNode tests passed")


def test_nation():
    """Test NationNode class"""
    print("Testing NationNode class...")
    nation = NationNode("Deutschland")
    
    assert nation.name == "Deutschland"
    
    region1 = RegionNode("Bayern", 75.0)
    region2 = RegionNode("Norddeutschland", 70.0)
    nation.add_region(region1)
    nation.add_region(region2)
    
    assert len(nation.regionen) == 2
    print("✓ NationNode tests passed")


def test_bank():
    """Test BankNode class"""
    print("Testing BankNode class...")
    bank = BankNode("Test-Bank", 50000.0, 0.05)
    
    assert bank.name == "Test-Bank"
    assert bank.eigenkapital == 50000.0
    assert bank.zinssatz == 0.05
    
    # Test Kreditvergabe
    erfolg = bank.kreditvergabe("Kunde1", 1000.0, 0.8)
    assert erfolg == True
    assert bank.eigenkapital == 49000.0
    
    # Test mit niedriger Kreditwürdigkeit
    erfolg = bank.kreditvergabe("Kunde2", 1000.0, 0.3)
    assert erfolg == False
    print("✓ BankNode tests passed")


def test_zentralbank():
    """Test ZentralbankNode class"""
    print("Testing ZentralbankNode class...")
    zentralbank = ZentralbankNode("EZB", 0.03, 1000000.0)
    
    assert zentralbank.name == "EZB"
    assert zentralbank.basiszins == 0.03
    
    bank = BankNode("Test-Bank", 50000.0, 0.05)
    zentralbank.registriere_bank(bank)
    
    assert len(zentralbank.banken) == 1
    assert bank.zentralbank == zentralbank
    print("✓ ZentralbankNode tests passed")


def test_staat():
    """Test StaatNode class"""
    print("Testing StaatNode class...")
    staat = StaatNode("Deutschland", 0.25)
    
    assert staat.name == "Deutschland"
    assert staat.steuersatz == 0.25
    
    # Test Subvention hinzufügen
    staat.add_subvention("Firma1", 500.0)
    assert staat.subventionen["Firma1"] == 500.0
    
    # Test Besteuerung
    region = RegionNode("Test", 70.0)
    unternehmen = UnternehmenNode("Test-Firma", region)
    unternehmen.konto = 10000.0
    
    steuern = staat.besteuere(unternehmen, 1000.0)
    assert steuern == 250.0  # 25% von 1000
    assert staat.steuereinnahmen == 250.0
    print("✓ StaatNode tests passed")


def test_simulation_engine():
    """Test SimulationEngine class"""
    print("Testing SimulationEngine class...")
    engine = SimulationEngine()
    
    # Erstelle einfaches Setup
    deutschland = NationNode("Deutschland")
    bayern = RegionNode("Bayern", 75.0)
    deutschland.add_region(bayern)
    
    engine.add_nation(deutschland)
    
    assert len(engine.nationen) == 1
    assert engine.tick_count == 0
    print("✓ SimulationEngine tests passed")


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*80)
    print("RUNNING ECONOMIC SIMULATION TESTS")
    print("="*80 + "\n")
    
    try:
        test_produkt()
        test_warenkorb()
        test_maschine()
        test_person()
        test_unternehmen()
        test_region()
        test_nation()
        test_bank()
        test_zentralbank()
        test_staat()
        test_simulation_engine()
        
        print("\n" + "="*80)
        print("✓ ALL TESTS PASSED!")
        print("="*80 + "\n")
        return True
        
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n✗ UNEXPECTED ERROR: {e}")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
