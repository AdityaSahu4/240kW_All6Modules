# Fixed_240KW_Frontend and Backend - Updated

This project contains both **Frontend** and **Backend** for the Fixed 240 kW platform.

---

## ⚙️ Backend Setup

> **All backend steps must be done inside the `backend` folder**

### Steps

1. Navigate to backend folder:
```bash
cd backend
```
2. Create a virtual environment
```bash
python -m venv .venv
```
3. Activate the virtual environment
```bash
.venv\Scripts\activate
```
4. Install backend dependencies:
```bash
pip install -r requirements.txt
```
5. Run the backend server
```bash
uvicorn app:app --reload
```
6. Access backend URLs
```bash
http://127.0.0.1:8000
http://127.0.0.1:8000/docs
```


---

## ⚙️ Frontend Setup

---

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

---

## Installation

1. Navigate to root folder:
```bash
cd..
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```
4. Open your browser and navigate to:
```bash
http://localhost:5173
```

---

## 📂 Project Structure

```text
Fixed_240KW_Frontend_Backend/
│
├── backend/
│   ├── core/                 # Database & core configuration
│   ├── modules/              # Feature-based backend modules
│   │   ├── auth/             # Authentication & authorization (SignUp and Login)
│   │   ├── product_details/  # ProductDetails-related APIs & models (Product Details Page - Inquiry)
│   ├── app.py                # FastAPI application entry point
│   └── requirements.txt      # Backend dependencies
│
├── src/
│   ├── contexts/             # Global state management
│   ├── layouts/              # Layout components
│   ├── pages/                # Application pages
│   └── services/             # API service layer
│
├── .gitignore
├── package.json
└── README.md



