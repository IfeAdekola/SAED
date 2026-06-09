# NYSC SAED IMS

A React + Django information management system for NYSC SAED programs.

## Stack

- Backend: Django 5, SQLite, session auth
 - Frontend: React 19, Create React App (react-scripts), React Router, lucide-react

## Run Locally

Backend:

```powershell
.\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8002
```

Frontend:

```powershell
cd frontend
npm install
npm start
```

Open:

```text
http://127.0.0.1:3001/
```

## Demo Accounts

Trainer:

```text
trainer@saed.test
password123
```

Admin:

```text
admin@saed.test
password123
```

Corps members can sign up from `/signup`.

## Useful Commands

```powershell
.\venv\Scripts\python.exe backend\manage.py check
.\venv\Scripts\python.exe backend\manage.py makemigrations
.\venv\Scripts\python.exe backend\manage.py migrate
.\venv\Scripts\python.exe backend\manage.py seed_saed
cd frontend
npm run build
```
