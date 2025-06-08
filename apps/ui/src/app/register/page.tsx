'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { AuthLayout } from '@/components/auth/AuthLayout';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  emailUpdates: boolean;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        password: data.password
      });
      toast.success('Account created! Please check your email to verify your account.');
      router.push('/login?message=registration-success');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score++;
    else feedback.push('at least 8 characters');
    
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('one uppercase letter');
    
    if (/[a-z]/.test(password)) score++;
    else feedback.push('one lowercase letter');
    
    if (/[0-9]/.test(password)) score++;
    else feedback.push('one number');
    
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('one special character');

    const strength = {
      0: { text: 'Very weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-500' },
      3: { text: 'Good', color: 'bg-yellow-400' },
      4: { text: 'Strong', color: 'bg-green-500' },
      5: { text: 'Very strong', color: 'bg-green-600' }
    };

    return {
      score,
      text: strength[score as keyof typeof strength].text,
      color: strength[score as keyof typeof strength].color,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Great password!'
    };
  };

  const strength = passwordStrength(password || '');

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your family history journey today"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First name
            </label>
            <input
              {...register('firstName', {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'First name must be less than 50 characters'
                }
              })}
              type="text"
              id="firstName"
              className={`form-input ${errors.firstName ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="form-error">{errors.firstName.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last name
            </label>
            <input
              {...register('lastName', {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'Last name must be less than 50 characters'
                }
              })}
              type="text"
              id="lastName"
              className={`form-input ${errors.lastName ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="form-error">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            id="email"
            className={`form-input ${errors.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Username */}
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              },
              maxLength: {
                value: 30,
                message: 'Username must be less than 30 characters'
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores'
              }
            })}
            type="text"
            id="username"
            className={`form-input ${errors.username ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="johndoe123"
          />
          {errors.username && (
            <p className="form-error">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`form-input pr-10 ${errors.password ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {/* Password strength indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{strength.text}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{strength.feedback}</p>
            </div>
          )}
          
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match'
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className={`form-input pr-10 ${errors.confirmPassword ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              {...register('agreeToTerms', {
                required: 'You must agree to the terms and conditions'
              })}
              id="agreeToTerms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="form-error ml-6">{errors.agreeToTerms.message}</p>
          )}

          <div className="flex items-start">
            <input
              {...register('emailUpdates')}
              id="emailUpdates"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="emailUpdates" className="ml-2 block text-sm text-gray-700">
              I would like to receive updates about new features and genealogy tips
            </label>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full btn-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner mr-2"></div>
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
} 