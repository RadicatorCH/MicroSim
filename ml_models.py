"""
Erweiterte ML-Modelle für MicroSim
Implementiert verschiedene Machine Learning Algorithmen für Wirtschaftsvorhersagen
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score, r2_score
import joblib
import os
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')

class MLModelManager:
    """Verwaltet und trainiert ML-Modelle für die Wirtschaftssimulation"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_performance = {}
        self.models_dir = "ml_models"
        
        # Erstelle Models-Verzeichnis falls es nicht existiert
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)
        
        # Initialisiere Standard-Modelle
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialisiert Standard-ML-Modelle"""
        # Einkommensvorhersage (Regression)
        self.models['income_prediction'] = {
            'linear': LinearRegression(),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42)
        }
        
        # Produktivitätsvorhersage (Regression)
        self.models['productivity_prediction'] = {
            'linear': LinearRegression(),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42)
        }
        
        # Kreditwürdigkeit (Klassifikation)
        self.models['credit_worthiness'] = {
            'logistic': LogisticRegression(random_state=42),
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42)
        }
        
        # Unternehmenserfolg (Klassifikation)
        self.models['company_success'] = {
            'logistic': LogisticRegression(random_state=42),
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42)
        }
        
        # Migration-Vorhersage (Klassifikation)
        self.models['migration_prediction'] = {
            'logistic': LogisticRegression(random_state=42),
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42)
        }
        
        # Scaler für Feature-Normalisierung
        self.scalers['standard'] = StandardScaler()
    
    def prepare_training_data(self, df: pd.DataFrame, target_column: str, 
                            feature_columns: List[str]) -> Tuple[np.ndarray, np.ndarray]:
        """Bereitet Trainingsdaten vor"""
        # Entferne Zeilen mit fehlenden Werten
        df_clean = df.dropna(subset=feature_columns + [target_column])
        
        if len(df_clean) == 0:
            raise ValueError("Keine gültigen Trainingsdaten verfügbar")
        
        X = df_clean[feature_columns].values
        y = df_clean[target_column].values
        
        return X, y
    
    def train_income_model(self, person_data: List[Dict]) -> Dict[str, Any]:
        """Trainiert Einkommensvorhersage-Modelle"""
        if len(person_data) < 10:
            return {'error': 'Nicht genügend Trainingsdaten'}
        
        df = pd.DataFrame(person_data)
        
        # Feature-Engineering für Einkommensvorhersage
        feature_columns = ['alter', 'bildung', 'gesundheit', 'region_bildung', 'hat_arbeitgeber']
        target_column = 'einkommen'
        
        try:
            X, y = self.prepare_training_data(df, target_column, feature_columns)
            
            # Trainiere verschiedene Modelle
            results = {}
            for model_name, model in self.models['income_prediction'].items():
                # Trainiere Modell
                model.fit(X, y)
                
                # Vorhersagen für Performance-Bewertung
                y_pred = model.predict(X)
                
                # Berechne Metriken
                mse = mean_squared_error(y, y_pred)
                r2 = r2_score(y, y_pred)
                
                results[model_name] = {
                    'mse': mse,
                    'r2': r2,
                    'rmse': np.sqrt(mse),
                    'mean_absolute_error': np.mean(np.abs(y - y_pred))
                }
                
                # Speichere Modell
                model_path = os.path.join(self.models_dir, f'income_{model_name}.joblib')
                joblib.dump(model, model_path)
            
            # Speichere Feature-Informationen
            feature_info = {
                'feature_columns': feature_columns,
                'target_column': target_column,
                'training_samples': len(X)
            }
            
            joblib.dump(feature_info, os.path.join(self.models_dir, 'income_features.joblib'))
            
            return {
                'success': True,
                'model_performance': results,
                'training_samples': len(X),
                'feature_columns': feature_columns
            }
            
        except Exception as e:
            return {'error': f'Training fehlgeschlagen: {str(e)}'}
    
    def train_productivity_model(self, person_data: List[Dict]) -> Dict[str, Any]:
        """Trainiert Produktivitätsvorhersage-Modelle"""
        if len(person_data) < 10:
            return {'error': 'Nicht genügend Trainingsdaten'}
        
        df = pd.DataFrame(person_data)
        
        # Feature-Engineering für Produktivitätsvorhersage
        feature_columns = ['alter', 'bildung', 'gesundheit', 'region_bildung']
        target_column = 'arbeitsproduktivitaet'
        
        try:
            X, y = self.prepare_training_data(df, target_column, feature_columns)
            
            results = {}
            for model_name, model in self.models['productivity_prediction'].items():
                model.fit(X, y)
                y_pred = model.predict(X)
                
                mse = mean_squared_error(y, y_pred)
                r2 = r2_score(y, y_pred)
                
                results[model_name] = {
                    'mse': mse,
                    'r2': r2,
                    'rmse': np.sqrt(mse),
                    'mean_absolute_error': np.mean(np.abs(y - y_pred))
                }
                
                model_path = os.path.join(self.models_dir, f'productivity_{model_name}.joblib')
                joblib.dump(model, model_path)
            
            feature_info = {
                'feature_columns': feature_columns,
                'target_column': target_column,
                'training_samples': len(X)
            }
            
            joblib.dump(feature_info, os.path.join(self.models_dir, 'productivity_features.joblib'))
            
            return {
                'success': True,
                'model_performance': results,
                'training_samples': len(X),
                'feature_columns': feature_columns
            }
            
        except Exception as e:
            return {'error': f'Training fehlgeschlagen: {str(e)}'}
    
    def train_credit_worthiness_model(self, person_data: List[Dict]) -> Dict[str, Any]:
        """Trainiert Kreditwürdigkeits-Modelle"""
        if len(person_data) < 20:
            return {'error': 'Nicht genügend Trainingsdaten für Klassifikation'}
        
        df = pd.DataFrame(person_data)
        
        # Erstelle binäre Kreditwürdigkeit basierend auf Einkommen und Bildung
        df['credit_worthy'] = ((df['einkommen'] > df['einkommen'].median()) & 
                              (df['bildung'] > df['bildung'].median())).astype(int)
        
        feature_columns = ['alter', 'bildung', 'gesundheit', 'einkommen', 'region_bildung']
        target_column = 'credit_worthy'
        
        try:
            X, y = self.prepare_training_data(df, target_column, feature_columns)
            
            results = {}
            for model_name, model in self.models['credit_worthiness'].items():
                model.fit(X, y)
                y_pred = model.predict(X)
                
                accuracy = accuracy_score(y, y_pred)
                
                results[model_name] = {
                    'accuracy': accuracy,
                    'training_samples': len(X),
                    'positive_samples': int(np.sum(y)),
                    'negative_samples': int(len(y) - np.sum(y))
                }
                
                model_path = os.path.join(self.models_dir, f'credit_{model_name}.joblib')
                joblib.dump(model, model_path)
            
            feature_info = {
                'feature_columns': feature_columns,
                'target_column': target_column,
                'training_samples': len(X)
            }
            
            joblib.dump(feature_info, os.path.join(self.models_dir, 'credit_features.joblib'))
            
            return {
                'success': True,
                'model_performance': results,
                'training_samples': len(X),
                'feature_columns': feature_columns
            }
            
        except Exception as e:
            return {'error': f'Training fehlgeschlagen: {str(e)}'}
    
    def predict_income(self, features: Dict[str, float], model_type: str = 'random_forest') -> Dict[str, Any]:
        """Macht Einkommensvorhersage"""
        try:
            model_path = os.path.join(self.models_dir, f'income_{model_type}.joblib')
            feature_info_path = os.path.join(self.models_dir, 'income_features.joblib')
            
            if not os.path.exists(model_path) or not os.path.exists(feature_info_path):
                return {'error': 'Modell nicht trainiert'}
            
            model = joblib.load(model_path)
            feature_info = joblib.load(feature_info_path)
            
            # Bereite Features vor
            feature_vector = np.array([[features.get(col, 0) for col in feature_info['feature_columns']]])
            
            prediction = model.predict(feature_vector)[0]
            
            return {
                'predicted_income': float(prediction),
                'model_type': model_type,
                'features_used': feature_info['feature_columns'],
                'confidence': 'high' if model_type == 'random_forest' else 'medium'
            }
            
        except Exception as e:
            return {'error': f'Vorhersage fehlgeschlagen: {str(e)}'}
    
    def predict_productivity(self, features: Dict[str, float], model_type: str = 'random_forest') -> Dict[str, Any]:
        """Macht Produktivitätsvorhersage"""
        try:
            model_path = os.path.join(self.models_dir, f'productivity_{model_type}.joblib')
            feature_info_path = os.path.join(self.models_dir, 'productivity_features.joblib')
            
            if not os.path.exists(model_path) or not os.path.exists(feature_info_path):
                return {'error': 'Modell nicht trainiert'}
            
            model = joblib.load(model_path)
            feature_info = joblib.load(feature_info_path)
            
            feature_vector = np.array([[features.get(col, 0) for col in feature_info['feature_columns']]])
            prediction = model.predict(feature_vector)[0]
            
            return {
                'predicted_productivity': float(prediction),
                'model_type': model_type,
                'features_used': feature_info['feature_columns'],
                'confidence': 'high' if model_type == 'random_forest' else 'medium'
            }
            
        except Exception as e:
            return {'error': f'Vorhersage fehlgeschlagen: {str(e)}'}
    
    def predict_credit_worthiness(self, features: Dict[str, float], model_type: str = 'random_forest') -> Dict[str, Any]:
        """Macht Kreditwürdigkeits-Vorhersage"""
        try:
            model_path = os.path.join(self.models_dir, f'credit_{model_type}.joblib')
            feature_info_path = os.path.join(self.models_dir, 'credit_features.joblib')
            
            if not os.path.exists(model_path) or not os.path.exists(feature_info_path):
                return {'error': 'Modell nicht trainiert'}
            
            model = joblib.load(model_path)
            feature_info = joblib.load(feature_info_path)
            
            feature_vector = np.array([[features.get(col, 0) for col in feature_info['feature_columns']]])
            prediction = model.predict(feature_vector)[0]
            probability = model.predict_proba(feature_vector)[0]
            
            return {
                'credit_worthy': bool(prediction),
                'probability': float(max(probability)),
                'model_type': model_type,
                'features_used': feature_info['feature_columns'],
                'confidence': 'high' if model_type == 'random_forest' else 'medium'
            }
            
        except Exception as e:
            return {'error': f'Vorhersage fehlgeschlagen: {str(e)}'}
    
    def get_model_status(self) -> Dict[str, Any]:
        """Gibt Status aller trainierten Modelle zurück"""
        status = {}
        
        model_types = ['income', 'productivity', 'credit']
        
        for model_type in model_types:
            status[model_type] = {
                'trained': False,
                'models_available': [],
                'last_trained': None
            }
            
            # Prüfe verfügbare Modelle
            for file in os.listdir(self.models_dir):
                if file.startswith(f'{model_type}_') and file.endswith('.joblib'):
                    model_name = file.replace(f'{model_type}_', '').replace('.joblib', '')
                    if model_name != 'features':
                        status[model_type]['models_available'].append(model_name)
                        status[model_type]['trained'] = True
        
        return status
    
    def retrain_all_models(self, person_data: List[Dict]) -> Dict[str, Any]:
        """Trainiert alle Modelle neu"""
        results = {}
        
        # Trainiere Einkommensmodell
        income_result = self.train_income_model(person_data)
        results['income'] = income_result
        
        # Trainiere Produktivitätsmodell
        productivity_result = self.train_productivity_model(person_data)
        results['productivity'] = productivity_result
        
        # Trainiere Kreditwürdigkeitsmodell
        credit_result = self.train_credit_worthiness_model(person_data)
        results['credit'] = credit_result
        
        return results

# Globale ML-Model Manager Instanz
ml_model_manager = MLModelManager()
