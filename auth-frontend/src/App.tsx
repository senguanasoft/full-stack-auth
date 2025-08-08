// src/App.tsx
import  { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginForm } from './components/forms/LoginForm';
import { RegisterForm } from './components/forms/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { AuthCallback } from './components/AuthCallback';
import { ForgotPasswordForm } from './components/forms/ForgotPasswordForm';
import { ResetPasswordForm } from './components/forms/ResetPasswordForm';
import { EmailVerificationForm } from './components/forms/EmailVerificationForm';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
           <Route path="/verify-email" element={<EmailVerificationForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;