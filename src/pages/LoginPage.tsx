import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as LocationState)?.from || '/';

  // Form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation
  const validateForm = (): boolean => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    // Email validation
    if (!trimmedEmail) {
      setError('Email is required');
      return false;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!trimmedPassword) {
      setError('Password is required');
      return false;
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Sign-up specific validation
    if (isSignUp) {
      if (!trimmedName) {
        setError('Full name is required');
        return false;
      }

      if (trimmedName.length < 2) {
        setError('Name must be at least 2 characters');
        return false;
      }

      if (!confirmPassword.trim()) {
        setError('Please confirm your password');
        return false;
      }

      if (trimmedPassword !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Prepare request
      const url = isSignUp
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`;

      const body = isSignUp
        ? {
            email: email.trim().toLowerCase(),
            password,
            confirmPassword,
            name: name.trim(),
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      console.log('📤 Sending request to:', url);
      console.log('📦 Body:', body);

      // Send request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', res.status);

      // Parse response
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      console.log('📥 Response data:', data);

      // Handle errors
      if (!res.ok) {
        const errorMessage = data?.error || data?.message || 'Authentication failed';
        throw new Error(errorMessage);
      }

      // Check if token exists
      if (!data.token) {
        throw new Error('No authentication token received from server');
      }

      console.log('✅ Authentication successful');

      // Save token and fetch user info
      await login(data.token);

      // Reset form
      resetForm();

      // Redirect to original page or home
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('❌ Error:', err);

      // Handle specific error types
      let errorMessage = 'Something went wrong. Please try again.';

      if (err.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on ' + API_BASE_URL;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error on input change
  const handleInputChange = (field: string, value: string) => {
    setError('');

    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'name':
        setName(value);
        break;
      default:
        break;
    }
  };

  // Reset form
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Toggle between signup and signin
  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-500/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/50">
            <Film className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tighter">
            CINEBOOK
          </span>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            {isSignUp
              ? 'Sign up to book your favorite movies'
              : 'Sign in to your account'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name field - only on signup */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  disabled={loading}
                  autoComplete="name"
                />
              </motion.div>
            )}

            {/* Email field */}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              disabled={loading}
              autoComplete="email"
              required
            />

            {/* Password field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                disabled={loading}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1"
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Confirm Password field - only on signup */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  disabled={loading}
                  autoComplete="new-password"
                  required={isSignUp}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1"
                  disabled={loading}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm leading-snug">{error}</p>
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30 mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <span>Processing...</span>
                </div>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Toggle signup/signin */}
          <p className="text-center text-gray-400 mt-6 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={handleToggleMode}
              disabled={loading}
              className="text-red-500 font-semibold ml-2 hover:underline transition-colors disabled:opacity-50"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Info text */}
          <p className="text-center text-gray-500 text-xs mt-4">
            {isSignUp
              ? '✓ Your data is secure and encrypted'
              : '🔒 Keep your password safe and never share it'}
          </p>
        </div>

        {/* Debug info (remove in production) */}
        {import.meta.env.DEV && (
  <div className="mt-4 text-xs text-gray-500 text-center">
    API: {API_BASE_URL}
  </div>
)}
      </motion.div>
    </div>
  );
}