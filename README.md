# Bug Tracker Application

A modern, full-stack Bug Tracking system built with a Laravel backend and a React frontend. This application allows users to manage, assign, and track software bugs and tasks efficiently.

## 🛠 Tech Stack

### Backend
- **Laravel 12** (PHP Framework)
- **MySQL** (Database)

### Frontend
- **React 19** (User Interface)
- **Vite** (Build Tool & Development Server)
- **Tailwind CSS 4** (Styling)
- **React Router DOM** (Navigation)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:
- [PHP](https://www.php.net/) (v8.2 or higher recommended)
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) & npm

### Installation & Setup

#### 1. Backend (Laravel) Setup

Open your terminal, navigate to the root directory of the project, and run the following commands:

```bash
# Install PHP dependencies
composer install

# Create the environment configuration file
cp .env.example .env

# Generate the application encryption key
php artisan key:generate

# Make sure to create the 'bug_tracker' database in your MySQL server before proceeding!

# Run database migrations to create tables
php artisan migrate

# (Optional) Seed the database with a default Admin user
php artisan db:seed
```

#### 2. Frontend (React) Setup

Open a new terminal window, navigate to the `frontend` directory, and run the following commands:

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

### ▶️ Running the Application

You will need to run both the backend and frontend development servers simultaneously.

**Terminal 1: Start the Backend (Laravel API)**
```bash
# From the project root directory
php artisan serve
```
*(The backend will run at http://127.0.0.1:8000)*

**Terminal 2: Start the Frontend (React UI)**
```bash
# From the frontend directory
npm run dev
```
*(The frontend will run at http://localhost:5173)*

### 🔐 Default Login Credentials

If you ran the database seeder (`php artisan db:seed`), you can log in to the React application using the following credentials:

- **Email:** `admin@example.com`
- **Password:** `password`
