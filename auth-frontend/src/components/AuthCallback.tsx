// src/components/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { TokenService } from '../services/token.service';
import { LoadingSpinner } from './LoadingSpinner';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const handleCallback = async () => {
    try {
      const token = searchParams.get('token');
      if (token) {
        TokenService.setAccessToken(token);
        await initializeAuth();
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      TokenService.removeAccessToken();
      navigate('/login', { replace: true });
    }
  };
  useEffect(() => {
    handleCallback();
  }, [initializeAuth]);

  

  return <LoadingSpinner />;
};