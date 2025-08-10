# 🚀 Deploy Full Stack (Frontend + AI Backend)

## Option A: Railway (Easiest Full Stack)

### Step 1: Prepare Your Code
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"

### Step 2: Project Structure
Make sure your project has this structure:
```
FakeAccountDetector/
├── backend/
│   ├── api.py
│   ├── requirements.txt
│   └── dataset_generator.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── README.md
```

### Step 3: Add Railway Config
Create file: `railway.toml` in root folder:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd backend && python api.py"
```

### Step 4: Deploy
1. Connect your GitHub repository
2. Railway automatically detects Python
3. Your backend gets a URL like: `https://yourapp.railway.app`
4. Update frontend to use this API URL

## Option B: Heroku (Classic Choice)

### Step 1: Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Prepare for Heroku
Create `Procfile` in root:
```
web: cd backend && python api.py
```

Create `runtime.txt`:
```
python-3.11.0
```

### Step 3: Deploy
```bash
heroku create your-app-name
git add .
git commit -m "Deploy fake account detector"
git push heroku main
```

Your app will be live at: `https://your-app-name.herokuapp.com`

## Result: Full Working Website
- Frontend with beautiful interface
- Backend with real AI predictions
- Public URL anyone can access
- Portfolio-ready project!


