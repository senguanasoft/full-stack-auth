// src/components/forms/ForgotPasswordForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthService } from '../../services/auth.service';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

export const ForgotPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await AuthService.forgotPassword(data.email);
      toast.success('If an account with that email exists, we have sent a password reset link.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset link.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};