import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import os

class PCSpecRecommender:
    def __init__(self):
        self.cpu_encoder = LabelEncoder()
        self.gpu_encoder = LabelEncoder()
        self.ram_encoder = LabelEncoder()
        self.storage_encoder = LabelEncoder()
        self.motherboard_encoder = LabelEncoder()
        self.psu_encoder = LabelEncoder()
        self.purpose_encoder = LabelEncoder()
        
        self.scaler = StandardScaler()
        self.cpu_model = None
        self.gpu_model = None
        self.ram_model = None
        self.storage_model = None
        self.motherboard_model = None
        self.psu_model = None
        
    def load_data(self, csv_path):
        """Load the PC components dataset"""
        self.df = pd.read_csv(csv_path)
        return self.df
    
    def preprocess_data(self):
        """Preprocess the data for training"""
        # Encode categorical variables
        self.df['purpose_encoded'] = self.purpose_encoder.fit_transform(self.df['purpose'])
        self.df['cpu_name_encoded'] = self.cpu_encoder.fit_transform(self.df['cpu_name'])
        self.df['gpu_name_encoded'] = self.gpu_encoder.fit_transform(self.df['gpu_name'])
        self.df['ram_size_encoded'] = self.ram_encoder.fit_transform(self.df['ram_size'])
        self.df['storage_size_encoded'] = self.storage_encoder.fit_transform(self.df['storage_size'])
        self.df['motherboard_encoded'] = self.motherboard_encoder.fit_transform(self.df['motherboard'])
        self.df['psu_wattage_encoded'] = self.psu_encoder.fit_transform(self.df['psu_wattage'])
        
        # Create component description mappings
        self.cpu_descriptions = dict(zip(self.df['cpu_name'], self.df['cpu_description']))
        self.gpu_descriptions = dict(zip(self.df['gpu_name'], self.df['gpu_description']))
        self.ram_descriptions = dict(zip(self.df['ram_size'], self.df['ram_description']))
        self.storage_descriptions = dict(zip(self.df['storage_size'], self.df['storage_description']))
        self.motherboard_descriptions = dict(zip(self.df['motherboard'], self.df['motherboard_description']))
        self.psu_descriptions = dict(zip(self.df['psu_wattage'], self.df['psu_description']))
        
        # Features for training
        self.features = ['budget', 'purpose_encoded', 'performance_score']
        self.X = self.df[self.features]
        
        # Targets for different components
        self.y_cpu = self.df['cpu_name_encoded']
        self.y_gpu = self.df['gpu_name_encoded']
        self.y_ram = self.df['ram_size_encoded']
        self.y_storage = self.df['storage_size_encoded']
        self.y_motherboard = self.df['motherboard_encoded']
        self.y_psu = self.df['psu_wattage_encoded']
        
    def train_models(self):
        """Train Random Forest models for each component"""
        # Scale features
        X_scaled = self.scaler.fit_transform(self.X)
        
        # Train models
        self.cpu_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.cpu_model.fit(X_scaled, self.y_cpu)
        
        self.gpu_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.gpu_model.fit(X_scaled, self.y_gpu)
        
        self.ram_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.ram_model.fit(X_scaled, self.y_ram)
        
        self.storage_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.storage_model.fit(X_scaled, self.y_storage)
        
        self.motherboard_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.motherboard_model.fit(X_scaled, self.y_motherboard)
        
        self.psu_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.psu_model.fit(X_scaled, self.y_psu)
        
    def predict_components(self, budget, purpose):
        """Predict PC components based on budget and purpose"""
        # Encode purpose
        purpose_encoded = self.purpose_encoder.transform([purpose])[0]
        
        # Estimate performance score based on budget and purpose
        if purpose == 'Gaming':
            base_performance = min(95, (budget / 250000) * 100)
        elif purpose == 'Video Editing':
            base_performance = min(98, (budget / 200000) * 100)
        else:  # Office
            base_performance = min(80, (budget / 100000) * 100)
        
        # Prepare input features
        input_features = np.array([[budget, purpose_encoded, base_performance]])
        input_scaled = self.scaler.transform(input_features)
        
        # Predict components
        cpu_pred = int(round(self.cpu_model.predict(input_scaled)[0]))
        gpu_pred = int(round(self.gpu_model.predict(input_scaled)[0]))
        ram_pred = int(round(self.ram_model.predict(input_scaled)[0]))
        storage_pred = int(round(self.storage_model.predict(input_scaled)[0]))
        motherboard_pred = int(round(self.motherboard_model.predict(input_scaled)[0]))
        psu_pred = int(round(self.psu_model.predict(input_scaled)[0]))
        
        # Ensure predictions are within valid range
        cpu_pred = max(0, min(cpu_pred, len(self.cpu_encoder.classes_) - 1))
        gpu_pred = max(0, min(gpu_pred, len(self.gpu_encoder.classes_) - 1))
        ram_pred = max(0, min(ram_pred, len(self.ram_encoder.classes_) - 1))
        storage_pred = max(0, min(storage_pred, len(self.storage_encoder.classes_) - 1))
        motherboard_pred = max(0, min(motherboard_pred, len(self.motherboard_encoder.classes_) - 1))
        psu_pred = max(0, min(psu_pred, len(self.psu_encoder.classes_) - 1))
        
        # Decode predictions
        recommendation = {
            'cpu': self.cpu_encoder.inverse_transform([cpu_pred])[0],
            'gpu': self.gpu_encoder.inverse_transform([gpu_pred])[0],
            'ram': self.ram_encoder.inverse_transform([ram_pred])[0],
            'storage': self.storage_encoder.inverse_transform([storage_pred])[0],
            'motherboard': self.motherboard_encoder.inverse_transform([motherboard_pred])[0],
            'psu': self.psu_encoder.inverse_transform([psu_pred])[0],
            'performance_score': base_performance,
            'cpu_description': self.cpu_descriptions.get(self.cpu_encoder.inverse_transform([cpu_pred])[0], ''),
            'gpu_description': self.gpu_descriptions.get(self.gpu_encoder.inverse_transform([gpu_pred])[0], ''),
            'ram_description': self.ram_descriptions.get(self.ram_encoder.inverse_transform([ram_pred])[0], ''),
            'storage_description': self.storage_descriptions.get(self.storage_encoder.inverse_transform([storage_pred])[0], ''),
            'motherboard_description': self.motherboard_descriptions.get(self.motherboard_encoder.inverse_transform([motherboard_pred])[0], ''),
            'psu_description': self.psu_descriptions.get(self.psu_encoder.inverse_transform([psu_pred])[0], '')
        }
        
        return recommendation
    
    def save_models(self, model_dir):
        """Save trained models and encoders"""
        os.makedirs(model_dir, exist_ok=True)
        
        models = {
            'cpu_model': self.cpu_model,
            'gpu_model': self.gpu_model,
            'ram_model': self.ram_model,
            'storage_model': self.storage_model,
            'motherboard_model': self.motherboard_model,
            'psu_model': self.psu_model,
            'scaler': self.scaler,
            'cpu_encoder': self.cpu_encoder,
            'gpu_encoder': self.gpu_encoder,
            'ram_encoder': self.ram_encoder,
            'storage_encoder': self.storage_encoder,
            'motherboard_encoder': self.motherboard_encoder,
            'psu_encoder': self.psu_encoder,
            'purpose_encoder': self.purpose_encoder
        }
        
        for name, model in models.items():
            with open(os.path.join(model_dir, f'{name}.pkl'), 'wb') as f:
                pickle.dump(model, f)
    
    def load_models(self, model_dir):
        """Load trained models and encoders"""
        models = {
            'cpu_model', 'gpu_model', 'ram_model', 'storage_model',
            'motherboard_model', 'psu_model', 'scaler',
            'cpu_encoder', 'gpu_encoder', 'ram_encoder', 'storage_encoder',
            'motherboard_encoder', 'psu_encoder', 'purpose_encoder'
        }
        
        for name in models:
            with open(os.path.join(model_dir, f'{name}.pkl'), 'rb') as f:
                setattr(self, name, pickle.load(f))

def main():
    # Initialize recommender
    recommender = PCSpecRecommender()
    
    # Load and preprocess data
    print("Loading data...")
    recommender.load_data('pc_components.csv')
    recommender.preprocess_data()
    
    # Train models
    print("Training models...")
    recommender.train_models()
    
    # Save models
    print("Saving models...")
    recommender.save_models('ml-data/models')
    
    # Test predictions
    print("\nTesting predictions:")
    test_cases = [
        (70000, 'Gaming'),
        (100000, 'Video Editing'),
        (45000, 'Office'),
        (150000, 'Gaming'),
        (120000, 'Video Editing')
    ]
    
    for budget, purpose in test_cases:
        recommendation = recommender.predict_components(budget, purpose)
        print(f"\nBudget: ₹{budget:,}, Purpose: {purpose}")
        print(f"CPU: {recommendation['cpu']}")
        print(f"   └─ {recommendation['cpu_description']}")
        print(f"GPU: {recommendation['gpu']}")
        print(f"   └─ {recommendation['gpu_description']}")
        print(f"RAM: {recommendation['ram']}")
        print(f"   └─ {recommendation['ram_description']}")
        print(f"Storage: {recommendation['storage']}")
        print(f"   └─ {recommendation['storage_description']}")
        print(f"Motherboard: {recommendation['motherboard']}")
        print(f"   └─ {recommendation['motherboard_description']}")
        print(f"PSU: {recommendation['psu']}")
        print(f"   └─ {recommendation['psu_description']}")
        print(f"Performance Score: {recommendation['performance_score']:.1f}")

if __name__ == "__main__":
    main()