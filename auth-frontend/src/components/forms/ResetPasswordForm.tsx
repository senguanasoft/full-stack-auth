// src/components/forms/ResetPasswordForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthService } from '../../services/auth.service';

const schema = yup.object({
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ newPassword: string; confirmPassword: string }>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { newPassword: string }) => {
    if (!token) {
      toast.error('Invalid or missing token.');
      return;
    }
    try {
      await AuthService.resetPassword(token, data.newPassword);
      toast.success('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password. The link may be expired or invalid.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <input
                {...register('newPassword')}
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="New password"
              />
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <input
                {...register('confirmPassword')}
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};