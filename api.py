"""
Fake Account Detector API
Flask backend with machine learning model for detecting fake social media accounts
"""

import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import joblib
import logging
from dataset_generator import generate_fake_account_dataset, save_dataset

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Global variables for model and scaler
model = None
scaler = None
feature_columns = [
    'username_length', 'num_posts', 'num_followers', 'num_following',
    'account_age_days', 'has_profile_picture', 'has_bio', 
    'engagement_ratio', 'is_verified'
]

def load_or_create_dataset():
    """Load existing dataset or create a new one"""
    dataset_path = 'fake_accounts_dataset.csv'
    
    if os.path.exists(dataset_path):
        logger.info(f"Loading existing dataset from {dataset_path}")
        df = pd.read_csv(dataset_path)
    else:
        logger.info("Creating new dataset...")
        df = generate_fake_account_dataset(10000)
        save_dataset(df, dataset_path)
    
    return df

def train_model():
    """Train the Random Forest model"""
    global model, scaler
    
    logger.info("Starting model training...")
    
    # Load dataset
    df = load_or_create_dataset()
    
    # Prepare features and target
    X = df[feature_columns]
    y = df['is_fake']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'  # Handle class imbalance
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    logger.info(f"Model trained successfully!")
    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info(f"Classification Report:\n{classification_report(y_test, y_pred)}")
    
    # Save model and scaler
    joblib.dump(model, 'fake_account_model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    logger.info("Model and scaler saved to disk")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    logger.info("Feature Importance:")
    logger.info(feature_importance)
    
    return accuracy

def load_model():
    """Load trained model and scaler from disk"""
    global model, scaler
    
    try:
        if os.path.exists('fake_account_model.pkl') and os.path.exists('scaler.pkl'):
            model = joblib.load('fake_account_model.pkl')
            scaler = joblib.load('scaler.pkl')
            logger.info("Model and scaler loaded from disk")
            return True
    except Exception as e:
        logger.error(f"Error loading model: {e}")
    
    return False

def validate_input_data(data):
    """Validate input data for prediction"""
    required_fields = feature_columns
    
    # Check if all required fields are present
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate data types and ranges
    try:
        # Username length should be positive integer
        if not isinstance(data['username_length'], (int, float)) or data['username_length'] <= 0:
            return False, "username_length must be a positive number"
        
        # Post count should be non-negative
        if not isinstance(data['num_posts'], (int, float)) or data['num_posts'] < 0:
            return False, "num_posts must be a non-negative number"
        
        # Follower count should be non-negative
        if not isinstance(data['num_followers'], (int, float)) or data['num_followers'] < 0:
            return False, "num_followers must be a non-negative number"
        
        # Following count should be non-negative
        if not isinstance(data['num_following'], (int, float)) or data['num_following'] < 0:
            return False, "num_following must be a non-negative number"
        
        # Account age should be positive
        if not isinstance(data['account_age_days'], (int, float)) or data['account_age_days'] <= 0:
            return False, "account_age_days must be a positive number"
        
        # Boolean fields should be 0 or 1
        for bool_field in ['has_profile_picture', 'has_bio', 'is_verified']:
            if data[bool_field] not in [0, 1, True, False]:
                return False, f"{bool_field} must be 0 or 1"
        
        # Engagement ratio should be non-negative
        if not isinstance(data['engagement_ratio'], (int, float)) or data['engagement_ratio'] < 0:
            return False, "engagement_ratio must be a non-negative number"
        
    except (TypeError, ValueError) as e:
        return False, f"Invalid data type: {str(e)}"
    
    return True, "Valid"

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API information"""
    return jsonify({
        'message': 'Fake Account Detector API',
        'version': '1.0',
        'endpoints': {
            '/predict': 'POST - Predict if an account is fake',
            '/train': 'POST - Retrain the model',
            '/model-info': 'GET - Get model information'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict if an account is fake based on provided features"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate input data
        is_valid, message = validate_input_data(data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if model is loaded
        if model is None or scaler is None:
            return jsonify({'error': 'Model not loaded. Please train the model first.'}), 500
        
        # Prepare data for prediction
        input_data = []
        for feature in feature_columns:
            value = data[feature]
            # Convert boolean values to int
            if isinstance(value, bool):
                value = int(value)
            input_data.append(value)
        
        # Convert to numpy array and reshape
        input_array = np.array(input_data).reshape(1, -1)
        
        # Scale the input data
        input_scaled = scaler.transform(input_array)
        
        # Make prediction
        prediction = model.predict(input_scaled)[0]
        probability = model.predict_proba(input_scaled)[0]
        
        # Prepare response
        result = {
            'prediction': int(prediction),
            'is_fake': bool(prediction),
            'confidence': {
                'real_account': float(probability[0]),
                'fake_account': float(probability[1])
            },
            'probability_fake': float(probability[1]),
            'input_data': data
        }
        
        logger.info(f"Prediction made: {result}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/train', methods=['POST'])
def retrain_model():
    """Retrain the machine learning model"""
    try:
        logger.info("Starting model retraining...")
        accuracy = train_model()
        
        return jsonify({
            'message': 'Model retrained successfully',
            'accuracy': accuracy,
            'timestamp': pd.Timestamp.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in training: {str(e)}")
        return jsonify({'error': f'Training failed: {str(e)}'}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the current model"""
    try:
        if model is None:
            return jsonify({'error': 'No model loaded'}), 404
        
        # Get feature importance if available
        feature_importance = None
        if hasattr(model, 'feature_importances_'):
            feature_importance = dict(zip(feature_columns, model.feature_importances_.tolist()))
        
        info = {
            'model_type': type(model).__name__,
            'features': feature_columns,
            'feature_importance': feature_importance,
            'model_parameters': model.get_params() if hasattr(model, 'get_params') else None
        }
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None
    })

def initialize_app():
    """Initialize the application by loading or training the model"""
    logger.info("Initializing Fake Account Detector API...")
    
    # Try to load existing model
    if not load_model():
        logger.info("No existing model found. Training new model...")
        train_model()
    else:
        logger.info("Existing model loaded successfully")

if __name__ == '__main__':
    # Initialize the application
    initialize_app()
    
    # Run the Flask app
    logger.info("Starting Flask application...")
    print(f"🌐 API Server Running:")
    print(f"   Local:   http://localhost:5000")
    print(f"   Network: http://192.168.81.157:5000")
    print(f"   Share the network address with others on your WiFi!")
    print("-" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
