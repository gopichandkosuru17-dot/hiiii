# 🛡️ Fake Account Detector

A beautiful, production-ready web application that uses machine learning to detect fake social media accounts. Features an ultra-modern glassmorphism UI and a powerful Flask backend with Random Forest classification.

![Fake Account Detector](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-2.3+-red)
![HTML5](https://img.shields.io/badge/HTML5-Modern-orange)
![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

### 🎨 Frontend Features
- **Ultra-modern glassmorphism design** with colorful gradients and animations
- **Responsive design** that works perfectly on desktop and mobile
- **Dual input modes**: Manual form input or CSV batch upload
- **Real-time form validation** with automatic engagement ratio calculation
- **Beautiful result visualization** with confidence indicators and progress bars
- **Animated UI elements** with smooth transitions and hover effects
- **Quick demo functionality** to test the application instantly

### 🧠 Backend Features
- **Machine Learning powered**: Random Forest classifier with 85%+ accuracy
- **Automatic dataset generation**: Creates realistic synthetic data if none exists
- **RESTful API endpoints** for prediction, training, and model information
- **Comprehensive input validation** and error handling
- **Model persistence**: Saves trained models for future use
- **CORS enabled** for seamless frontend-backend communication
- **Health check endpoints** for monitoring

### 📊 Detection Features
The model analyzes 9 key features to determine if an account is fake:
- Username length
- Number of posts
- Number of followers
- Number of following
- Account age (in days)
- Profile picture presence
- Bio/description presence
- Engagement ratio (posts per follower)
- Verification status

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for cloning the repository)

### Installation & Setup

1. **Clone or Download the Project**
   ```bash
   # If you have git installed
   git clone <repository-url>
   cd FakeAccountDetector
   
   # Or download and extract the ZIP file
   ```

2. **Set Up the Backend**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Start the Flask API server
   python api.py
   ```
   
   The backend will:
   - Start on `http://localhost:5000`
   - Automatically generate a dataset if none exists
   - Train the machine learning model
   - Display model accuracy and feature importance

3. **Set Up the Frontend**
   ```bash
   # Open a new terminal window/tab
   cd frontend
   
   # Start a simple HTTP server (Python 3)
   python -m http.server 8000
   
   # OR if you have Python 2
   python -m SimpleHTTPServer 8000
   
   # OR if you have Node.js installed
   npx http-server -p 8000
   ```

4. **Access the Application**
   - Open your web browser
   - Navigate to `http://localhost:8000`
   - The application should load with the beautiful glassmorphism interface

## 💻 Running in VS Code

### Terminal 1 (Backend)
```bash
cd backend
pip install -r requirements.txt
python api.py
```

### Terminal 2 (Frontend)
```bash
cd frontend
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## 🎯 How to Use

### Manual Input Mode
1. Click on the **"Manual Input"** tab
2. Fill in the account details:
   - Username length (number of characters)
   - Number of posts published
   - Number of followers
   - Number of accounts following
   - Account age in days
   - Check boxes for profile picture, bio, and verification status
   - Engagement ratio (automatically calculated or manually entered)
3. Click **"Analyze Account"**
4. View the results with confidence scores and detailed breakdown

### CSV Batch Mode
1. Click on the **"CSV Upload"** tab
2. Prepare a CSV file with the following columns:
   ```
   username_length,num_posts,num_followers,num_following,account_age_days,has_profile_picture,has_bio,engagement_ratio,is_verified
   ```
3. Drag and drop the CSV file or click to select it
4. The system will process all accounts and show summary statistics
5. Download the results with predictions included

### Quick Demo
- Click the **floating play button** (bottom right) to load sample data
- Perfect for testing the application quickly

## 🔧 API Endpoints

### `GET /`
Returns API information and available endpoints.

### `POST /predict`
Predicts if an account is fake based on provided features.

**Request Body:**
```json
{
  "username_length": 12,
  "num_posts": 45,
  "num_followers": 234,
  "num_following": 156,
  "account_age_days": 120,
  "has_profile_picture": 1,
  "has_bio": 1,
  "engagement_ratio": 0.192,
  "is_verified": 0
}
```

**Response:**
```json
{
  "prediction": 0,
  "is_fake": false,
  "confidence": {
    "real_account": 0.85,
    "fake_account": 0.15
  },
  "probability_fake": 0.15,
  "input_data": { ... }
}
```

### `POST /train`
Retrains the machine learning model with the current dataset.

### `GET /model-info`
Returns information about the current model, including feature importance.

### `GET /health`
Health check endpoint to verify API status.

## 📱 Responsive Design

The application is fully responsive and adapts to different screen sizes:

- **Desktop**: Full feature layout with side-by-side elements
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single-column layout with touch-friendly controls

## 🎨 Design Features

### Glassmorphism UI
- Frosted glass effects with backdrop blur
- Semi-transparent containers with soft borders
- Subtle shadows and highlights for depth

### Color Scheme
- Dynamic gradient backgrounds that shift over time
- Colorful accent colors (teal, coral, purple, blue)
- High contrast text for accessibility

### Animations
- Smooth page transitions and loading states
- Hover effects on interactive elements
- Progress bar animations for results
- Floating particle effects in the background

## 🔍 Technical Details

### Machine Learning Model
- **Algorithm**: Random Forest Classifier
- **Features**: 9 social media account characteristics
- **Training Data**: 10,000 synthetic accounts (70% real, 30% fake)
- **Accuracy**: Typically 85-90% on test data
- **Class Balance**: Weighted to handle imbalanced data

### Frontend Architecture
- **No frameworks**: Pure HTML5, CSS3, and JavaScript
- **Modern CSS**: Flexbox, Grid, Custom Properties
- **ES6+ JavaScript**: Async/await, modules, modern syntax
- **Progressive Enhancement**: Works with JavaScript disabled

### Backend Architecture
- **Flask**: Lightweight Python web framework
- **Scikit-learn**: Machine learning library
- **Pandas/NumPy**: Data manipulation and numerical computing
- **Joblib**: Model serialization and persistence

## 🛠️ Customization

### Adding New Features
The code is well-commented and modular. To add new features:

1. **Backend**: Add new endpoints in `api.py`
2. **Frontend**: Add new functions in `script.js`
3. **Styling**: Modify `styles.css` for visual changes

### Changing the Model
To use a different ML algorithm:
1. Import the new model in `api.py`
2. Replace the `RandomForestClassifier` with your chosen algorithm
3. Adjust hyperparameters as needed

### Customizing the UI
The CSS uses custom properties (variables) for easy theming:
```css
:root {
  --primary-color: #4ecdc4;
  --secondary-color: #ff6b6b;
  --glass-bg: rgba(255, 255, 255, 0.1);
}
```

## 🐛 Troubleshooting

### Common Issues

**Backend not starting:**
- Check Python version (3.8+ required)
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 is not in use

**Frontend not loading:**
- Ensure you're running an HTTP server (not opening file directly)
- Check port 8000 is available
- Try a different port: `python -m http.server 8080`

**CORS errors:**
- Make sure backend is running on port 5000
- Check that CORS is enabled in `api.py`
- Verify frontend is accessing the correct API URL

**Model training fails:**
- Check available disk space for dataset
- Ensure all dependencies are installed
- Check console output for specific error messages

### Performance Tips

**For large CSV files:**
- Process in batches (automatically handled)
- Consider using the API directly for very large datasets
- Monitor memory usage during batch processing

**For slow loading:**
- Use a production WSGI server for the backend (gunicorn, uwsgi)
- Enable gzip compression on the web server
- Optimize images and reduce file sizes

## 📄 License

This project is provided as-is for educational and demonstration purposes. Feel free to use, modify, and distribute according to your needs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all dependencies are properly installed
4. Verify both backend and frontend servers are running

---

**Enjoy detecting fake accounts with style! 🛡️✨**


#   h i i i i  
 #   h i i i i  
 