# Methane Yield Prediction with Machine Learning

A professional, full-stack web application designed to predict methane yield in anaerobic digestion processors using machine learning algorithms.

## Features
- **Machine Learning Integration**: Predicts methane yield based on Chemical Oxygen Demand (COD), OLR (Flow), C/N Ratio, Temperature, pH, HRT, and total processing Time.
- **FastAPI Backend**: Secure, high-performance Python backend managing inference using Scikit-Learn models.
- **JWT & Role-Based Access Control**: Secure user authentication and tiered access parameters.
- **React + Vite Frontend**: A dynamic, premium user interface styled with modern dark-mode aesthetics, glassmorphism, and micro-animations.
- **Literature Validation**: Includes foundational literature demonstrating the efficacy of ML in anaerobic digestion prediction. See the [Research Papers](Research_Papers.md) for 10 validated references.

## Getting Started

### Quick Start
To launch the entire application seamlessly using `concurrently`:
1. Ensure you have Python and Node installed.
2. Run the start command from the project root:
```bash
npm install
npm run dev
```

This will automatically serve both the React Frontend (http://localhost:5173) and FastAPI Backend (http://127.0.0.1:8000).

### Manual Setup (Alternatively)

**Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

## Scientific Context
To understand the scientific models backing this project, read [Research_Papers.md](./Research_Papers.md) which lists 10 core peer-reviewed papers related strictly to modeling anaerobic digestion with computational machine learning pipelines.
