// src/components/forms/EmailVerificationForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';

const schema = yup.object({
  code: yup.string().required('El código es requerido').length(6, 'El código debe tener 6 dígitos'),
});

export const EmailVerificationForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ code: string }>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { code: string }) => {
    try {
      await api.post('/auth/verify-email', { code: data.code });
      toast.success('¡Email verificado con éxito! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      toast.error('Código de verificación inválido o expirado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifica tu dirección de correo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hemos enviado un código a tu email. Ingresa el código a continuación.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('code')}
            type="text"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ingresa el código de 6 dígitos"
          />
          {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};