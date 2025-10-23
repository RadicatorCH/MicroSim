"""
MicroSim API Server - Flask Backend für ML-Integration
Bietet REST-API für EcoSim Frontend mit ML-Funktionalitäten
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Any
import threading
import time
from economic_simulation import *
from ml_models import ml_model_manager

app = Flask(__name__)
CORS(app)  # Erlaubt Cross-Origin Requests für EcoSim Frontend

# Globale Simulation Engine
simulation_engine = None
simulation_thread = None
is_running = False

class MLFeatureExtractor:
    """Extrahiert ML-Features aus der Simulation"""
    
    @staticmethod
    def extract_person_features(person: PersonNode) -> Dict[str, float]:
        """Extrahiert Features für eine Person"""
        return {
            'alter': person.alter,
            'bildung': person.bildung,
            'gesundheit': person.gesundheit,
            'einkommen': person.einkommen,
            'arbeitsproduktivitaet': person.arbeitsproduktivitaet(),
            'region_bildung': person.region.bildung if person.region else 0,
            'hat_arbeitgeber': 1 if person.arbeitgeber else 0
        }
    
    @staticmethod
    def extract_company_features(company: UnternehmenNode) -> Dict[str, float]:
        """Extrahiert Features für ein Unternehmen"""
        return {
            'mitarbeiter_anzahl': len(company.mitarbeiter),
            'maschinen_anzahl': len(company.maschinen),
            'konto': company.konto,
            'durchschnittliche_mitarbeiterqualitaet': company.durchschnittliche_mitarbeiterqualitaet(),
            'lager_gesamt': sum(company.lager.values()),
            'produkte_anzahl': len(company.produkte)
        }
    
    @staticmethod
    def extract_region_features(region: RegionNode) -> Dict[str, float]:
        """Extrahiert Features für eine Region"""
        return {
            'bildung': region.bildung,
            'bevoelkerung': len(region.bevoelkerung),
            'unternehmen_anzahl': len(region.unternehmen),
            'rohstoffe_gesamt': sum(region.rohstoffe.values()),
            'durchschnittliche_mitarbeiterqualitaet': region.durchschnittliche_mitarbeiterqualitaet()
        }

class MLDataCollector:
    """Sammelt und verwaltet ML-Daten aus der Simulation"""
    
    def __init__(self):
        self.historical_data = {
            'persons': [],
            'companies': [],
            'regions': [],
            'simulation_ticks': []
        }
    
    def collect_tick_data(self, engine: SimulationEngine):
        """Sammelt Daten für einen Tick"""
        tick_data = {
            'tick': engine.tick_count,
            'timestamp': time.time(),
            'persons': [],
            'companies': [],
            'regions': []
        }
        
        # Sammle Personendaten
        for nation in engine.nationen:
            for region in nation.regionen:
                for person in region.bevoelkerung:
                    person_data = MLFeatureExtractor.extract_person_features(person)
                    person_data['person_id'] = person.name
                    person_data['region'] = region.name
                    person_data['nation'] = nation.name
                    tick_data['persons'].append(person_data)
        
        # Sammle Unternehmensdaten
        for nation in engine.nationen:
            for region in nation.regionen:
                for company in region.unternehmen:
                    company_data = MLFeatureExtractor.extract_company_features(company)
                    company_data['company_id'] = company.name
                    company_data['region'] = region.name
                    company_data['nation'] = nation.name
                    tick_data['companies'].append(company_data)
        
        # Sammle Regionendaten
        for nation in engine.nationen:
            for region in nation.regionen:
                region_data = MLFeatureExtractor.extract_region_features(region)
                region_data['region_id'] = region.name
                region_data['nation'] = nation.name
                tick_data['regions'].append(region_data)
        
        # Speichere historische Daten
        self.historical_data['simulation_ticks'].append(tick_data)
        
        # Behalte nur die letzten 100 Ticks im Speicher
        if len(self.historical_data['simulation_ticks']) > 100:
            self.historical_data['simulation_ticks'].pop(0)
    
    def get_dataframe(self, entity_type: str) -> pd.DataFrame:
        """Konvertiert historische Daten zu DataFrame für ML"""
        data = []
        for tick_data in self.historical_data['simulation_ticks']:
            for entity in tick_data[entity_type]:
                entity['tick'] = tick_data['tick']
                entity['timestamp'] = tick_data['timestamp']
                data.append(entity)
        return pd.DataFrame(data)

# Globale ML-Datensammlung
ml_collector = MLDataCollector()

def run_simulation_loop():
    """Läuft kontinuierlich und sammelt ML-Daten"""
    global simulation_engine, is_running, ml_collector
    
    while is_running:
        if simulation_engine:
            simulation_engine.run_tick()
            ml_collector.collect_tick_data(simulation_engine)
        time.sleep(1)  # 1 Sekunde pro Tick

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health Check Endpoint"""
    return jsonify({
        'status': 'healthy',
        'simulation_running': is_running,
        'tick_count': simulation_engine.tick_count if simulation_engine else 0
    })

@app.route('/api/simulation/start', methods=['POST'])
def start_simulation():
    """Startet die Simulation"""
    global simulation_engine, simulation_thread, is_running
    
    if not simulation_engine:
        simulation_engine = erstelle_beispiel_simulation()
    
    if not is_running:
        is_running = True
        simulation_thread = threading.Thread(target=run_simulation_loop)
        simulation_thread.daemon = True
        simulation_thread.start()
        
        return jsonify({
            'status': 'started',
            'message': 'Simulation gestartet'
        })
    
    return jsonify({
        'status': 'already_running',
        'message': 'Simulation läuft bereits'
    })

@app.route('/api/simulation/stop', methods=['POST'])
def stop_simulation():
    """Stoppt die Simulation"""
    global is_running
    
    is_running = False
    
    return jsonify({
        'status': 'stopped',
        'message': 'Simulation gestoppt'
    })

@app.route('/api/simulation/status', methods=['GET'])
def get_simulation_status():
    """Gibt aktuellen Simulationsstatus zurück"""
    if not simulation_engine:
        return jsonify({
            'running': False,
            'tick_count': 0,
            'entities': {
                'persons': 0,
                'companies': 0,
                'regions': 0,
                'nations': 0
            }
        })
    
    # Zähle Entitäten
    persons = sum(len(region.bevoelkerung) for nation in simulation_engine.nationen for region in nation.regionen)
    companies = sum(len(region.unternehmen) for nation in simulation_engine.nationen for region in nation.regionen)
    regions = sum(len(nation.regionen) for nation in simulation_engine.nationen)
    nations = len(simulation_engine.nationen)
    
    return jsonify({
        'running': is_running,
        'tick_count': simulation_engine.tick_count,
        'entities': {
            'persons': persons,
            'companies': companies,
            'regions': regions,
            'nations': nations
        }
    })

@app.route('/api/ml/data/<entity_type>', methods=['GET'])
def get_ml_data(entity_type):
    """Gibt ML-Daten für bestimmten Entitätstyp zurück"""
    if entity_type not in ['persons', 'companies', 'regions']:
        return jsonify({'error': 'Invalid entity type'}), 400
    
    df = ml_collector.get_dataframe(entity_type)
    
    if df.empty:
        return jsonify({
            'data': [],
            'columns': [],
            'message': 'No data available yet'
        })
    
    return jsonify({
        'data': df.to_dict('records'),
        'columns': list(df.columns),
        'shape': df.shape
    })

@app.route('/api/ml/features/<entity_type>', methods=['GET'])
def get_feature_summary(entity_type):
    """Gibt Feature-Zusammenfassung zurück"""
    if entity_type not in ['persons', 'companies', 'regions']:
        return jsonify({'error': 'Invalid entity type'}), 400
    
    df = ml_collector.get_dataframe(entity_type)
    
    if df.empty:
        return jsonify({'message': 'No data available yet'})
    
    # Numerische Features
    numeric_features = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # Statistiken
    stats = {}
    for col in numeric_features:
        stats[col] = {
            'mean': float(df[col].mean()),
            'std': float(df[col].std()),
            'min': float(df[col].min()),
            'max': float(df[col].max()),
            'count': int(df[col].count())
        }
    
    return jsonify({
        'features': numeric_features,
        'statistics': stats,
        'total_records': len(df)
    })

@app.route('/api/ml/predictions/income', methods=['POST'])
def predict_income():
    """Erweiterte ML-Modelle für Einkommensvorhersage"""
    try:
        data = request.json
        person_features = data.get('features', {})
        model_type = data.get('model_type', 'random_forest')
        
        # Verwende ML-Model Manager für Vorhersage
        result = ml_model_manager.predict_income(person_features, model_type)
        
        if 'error' in result:
            # Fallback auf einfaches Modell
            predicted_income = (
                person_features.get('bildung', 50) * 20 +
                person_features.get('gesundheit', 50) * 15 +
                person_features.get('alter', 30) * 2 +
                person_features.get('region_bildung', 50) * 10
            )
            
            return jsonify({
                'predicted_income': float(predicted_income),
                'features_used': list(person_features.keys()),
                'model_type': 'fallback_linear',
                'note': 'ML-Modell nicht verfügbar, verwende Fallback'
            })
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/predictions/productivity', methods=['POST'])
def predict_productivity():
    """Erweiterte ML-Modelle für Produktivitätsvorhersage"""
    try:
        data = request.json
        person_features = data.get('features', {})
        model_type = data.get('model_type', 'random_forest')
        
        # Verwende ML-Model Manager für Vorhersage
        result = ml_model_manager.predict_productivity(person_features, model_type)
        
        if 'error' in result:
            # Fallback auf einfaches Modell
            predicted_productivity = (
                person_features.get('bildung', 50) * 0.01 +
                person_features.get('gesundheit', 50) * 0.01 +
                person_features.get('region_bildung', 50) * 0.005
            ) * 1.5
            
            return jsonify({
                'predicted_productivity': float(predicted_productivity),
                'features_used': list(person_features.keys()),
                'model_type': 'fallback_linear',
                'note': 'ML-Modell nicht verfügbar, verwende Fallback'
            })
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/predictions/credit', methods=['POST'])
def predict_credit_worthiness():
    """Kreditwürdigkeits-Vorhersage"""
    try:
        data = request.json
        person_features = data.get('features', {})
        model_type = data.get('model_type', 'random_forest')
        
        result = ml_model_manager.predict_credit_worthiness(person_features, model_type)
        
        if 'error' in result:
            # Fallback basierend auf Einkommen und Bildung
            income = person_features.get('einkommen', 2000)
            education = person_features.get('bildung', 50)
            credit_worthy = income > 2500 and education > 60
            
            return jsonify({
                'credit_worthy': credit_worthy,
                'probability': 0.7 if credit_worthy else 0.3,
                'features_used': list(person_features.keys()),
                'model_type': 'fallback_rule_based',
                'note': 'ML-Modell nicht verfügbar, verwende Fallback'
            })
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/train', methods=['POST'])
def train_ml_models():
    """Trainiert alle ML-Modelle mit aktuellen Daten"""
    try:
        # Hole aktuelle Personendaten
        person_data = ml_collector.get_dataframe('persons')
        
        if len(person_data) < 10:
            return jsonify({
                'error': 'Nicht genügend Trainingsdaten verfügbar',
                'available_samples': len(person_data),
                'minimum_required': 10
            })
        
        # Konvertiere zu Dictionary-Liste
        person_data_list = person_data.to_dict('records')
        
        # Trainiere alle Modelle
        results = ml_model_manager.retrain_all_models(person_data_list)
        
        return jsonify({
            'success': True,
            'training_results': results,
            'total_samples': len(person_data_list)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/models/status', methods=['GET'])
def get_model_status():
    """Gibt Status aller ML-Modelle zurück"""
    try:
        status = ml_model_manager.get_model_status()
        return jsonify(status)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/models/train/<model_type>', methods=['POST'])
def train_specific_model(model_type):
    """Trainiert ein spezifisches ML-Modell"""
    try:
        person_data = ml_collector.get_dataframe('persons')
        
        if len(person_data) < 10:
            return jsonify({
                'error': 'Nicht genügend Trainingsdaten verfügbar',
                'available_samples': len(person_data)
            })
        
        person_data_list = person_data.to_dict('records')
        
        if model_type == 'income':
            result = ml_model_manager.train_income_model(person_data_list)
        elif model_type == 'productivity':
            result = ml_model_manager.train_productivity_model(person_data_list)
        elif model_type == 'credit':
            result = ml_model_manager.train_credit_worthiness_model(person_data_list)
        else:
            return jsonify({'error': f'Unbekannter Modelltyp: {model_type}'}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/simulation/entities', methods=['GET'])
def get_entities():
    """Gibt alle aktuellen Entitäten zurück"""
    if not simulation_engine:
        return jsonify({'entities': {}})
    
    entities = {
        'persons': [],
        'companies': [],
        'regions': [],
        'nations': []
    }
    
    # Sammle alle Entitäten
    for nation in simulation_engine.nationen:
        nation_data = {
            'name': nation.name,
            'regions': []
        }
        
        for region in nation.regionen:
            region_data = {
                'name': region.name,
                'bildung': region.bildung,
                'bevoelkerung': len(region.bevoelkerung),
                'unternehmen': len(region.unternehmen),
                'persons': [],
                'companies': []
            }
            
            for person in region.bevoelkerung:
                person_data = MLFeatureExtractor.extract_person_features(person)
                person_data['name'] = person.name
                region_data['persons'].append(person_data)
            
            for company in region.unternehmen:
                company_data = MLFeatureExtractor.extract_company_features(company)
                company_data['name'] = company.name
                region_data['companies'].append(company_data)
            
            nation_data['regions'].append(region_data)
            entities['regions'].append(region_data)
        
        entities['nations'].append(nation_data)
    
    return jsonify(entities)

if __name__ == '__main__':
    print("🚀 Starte MicroSim API Server...")
    print("📊 Backend für ML-Integration bereit")
    print("🌐 API verfügbar unter: http://localhost:5000")
    print("📖 API Dokumentation:")
    print("  Simulation Control:")
    print("  - GET  /api/health - Health Check")
    print("  - POST /api/simulation/start - Simulation starten")
    print("  - POST /api/simulation/stop - Simulation stoppen")
    print("  - GET  /api/simulation/status - Simulationsstatus")
    print("  - GET  /api/simulation/entities - Alle Entitäten")
    print("")
    print("  ML Data Access:")
    print("  - GET  /api/ml/data/<entity_type> - ML-Daten abrufen")
    print("  - GET  /api/ml/features/<entity_type> - Feature-Zusammenfassung")
    print("")
    print("  ML Predictions:")
    print("  - POST /api/ml/predictions/income - Einkommensvorhersage")
    print("  - POST /api/ml/predictions/productivity - Produktivitätsvorhersage")
    print("  - POST /api/ml/predictions/credit - Kreditwürdigkeits-Vorhersage")
    print("")
    print("  ML Training:")
    print("  - POST /api/ml/train - Alle Modelle trainieren")
    print("  - POST /api/ml/models/train/<type> - Spezifisches Modell trainieren")
    print("  - GET  /api/ml/models/status - Modell-Status abrufen")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
