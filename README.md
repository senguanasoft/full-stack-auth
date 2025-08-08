# Full-Stack Authentication System

A comprehensive authentication system built with **NestJS** (backend) and **React + TypeScript** (frontend), featuring multiple authentication methods, email verification, social login, and secure token management.

## 🚀 Features

### Backend (NestJS)
- **JWT Authentication** with access and refresh tokens
- **Google OAuth 2.0** integration
- **Email verification** system with verification codes
- **Password reset** functionality
- **Rate limiting** and throttling protection
- **Session management** with device tracking
- **Social account linking**
- **Secure cookie-based** refresh token storage
- **Input validation** with class-validator
- **TypeORM** database integration
- **Email service** with Nodemailer

### Frontend (React + TypeScript)
- **Modern UI** with Tailwind CSS
- **Form handling** with React Hook Form + Yup validation
- **State management** with Zustand
- **Protected routes** with React Router
- **Google OAuth** integration
- **Toast notifications** with React Hot Toast
- **Responsive design**
- **TypeScript** for type safety

## 🏗️ Architecture

```
full-stack-auth/
├── auth-backend/          # NestJS API server
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # User management
│   │   ├── social-accounts/ # Social login handling
│   │   ├── entities/     # Database entities
│   │   └── services/     # Business logic services
│   └── test/             # Backend tests
└── auth-frontend/        # React application
    ├── src/
    │   ├── components/   # React components
    │   ├── services/     # API services
    │   ├── store/        # State management
    │   └── types/        # TypeScript types
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: SQL Server (TypeORM)
- **Authentication**: JWT, Passport.js
- **Email**: Nodemailer
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt, rate limiting, CORS

### Frontend
- **Framework**: React 19.x
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand
- **Forms**: React Hook Form + Yup
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **SQL Server** database
- **Google OAuth** credentials (for social login)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd full-stack-auth
```

### 2. Backend Setup

```bash
cd auth-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# App
PORT=3000
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd auth-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Database Setup

Run the database migrations:

```bash
cd auth-backend
npm run migration:run
```

### 5. Start the Applications

**Backend:**
```bash
cd auth-backend
npm run start:dev
```

**Frontend:**
```bash
cd auth-frontend
npm run dev
```

The applications will be available at:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/verify-email` | Email verification |
| `POST` | `/api/auth/resend-verification` | Resend verification code |
| `GET` | `/api/auth/google` | Google OAuth initiation |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | User logout |
| `POST` | `/api/auth/logout-all` | Logout from all devices |
| `GET` | `/api/auth/profile` | Get user profile |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

## 🔐 Security Features

- **JWT Tokens**: Secure access and refresh token system
- **HTTP-Only Cookies**: Refresh tokens stored in secure cookies
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configured for secure cross-origin requests
- **Session Management**: Track and manage user sessions

## 🎨 Frontend Features

### Components
- **LoginForm**: Email/password authentication
- **RegisterForm**: User registration
- **EmailVerificationForm**: Email verification
- **ForgotPasswordForm**: Password reset request
- **ResetPasswordForm**: Password reset
- **Dashboard**: Protected user dashboard
- **AuthCallback**: OAuth callback handling
- **ProtectedRoute**: Route protection wrapper

### State Management
- **Auth Store**: User authentication state
- **Token Service**: Token management utilities
- **API Service**: HTTP client configuration

## 🧪 Testing

### Backend Tests
```bash
cd auth-backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd auth-frontend

# Linting
npm run lint

# Build
npm run build
```

## 📦 Available Scripts

### Backend
```bash
npm run build          # Build the application
npm run start          # Start the application
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run start:prod     # Start in production mode
npm run lint           # Lint the code
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Lint the code
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
- Database configuration
- JWT secrets
- Google OAuth credentials
- Email service settings
- Application settings

**Frontend (.env):**
- API base URL
- Google OAuth client ID

### Database Entities

- **User**: Core user information
- **EmailVerificationCode**: Email verification codes
- **RefreshToken**: JWT refresh tokens
- **UserSession**: User session tracking
- **SocialAccount**: Social login accounts

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred hosting service
4. Configure database connection
5. Set up email service

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

Stay updated with the latest features and security patches by regularly pulling from the main branch.

---

**Built with ❤️ using NestJS and React**
