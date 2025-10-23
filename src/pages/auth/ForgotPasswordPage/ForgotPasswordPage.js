// src/pages/auth/ForgotPasswordPage/ForgotPasswordPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';
import { isValidEmail } from '../../../utils/validators';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';

/**
 * Beautiful Forgot Password Page
 */
const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { forgotPassword, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Reset Password'));
  }, [dispatch]);

  useEffect(() => {
    // Validate email in real-time
    if (formData.email) {
      const emailValidation = isValidEmail(formData.email);
      setIsEmailValid(emailValidation.isValid);
      
      if (!emailValidation.isValid && formData.email.length > 0) {
        setErrors({ email: emailValidation.message });
      } else {
        setErrors({});
      }
    } else {
      setIsEmailValid(false);
      setErrors({});
    }
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailValidation = isValidEmail(formData.email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.message });
      return;
    }

    try {
      const result = await forgotPassword(formData.email);
      
      if (result.payload) {
        setIsSubmitted(true);
      }
    } catch (error) {
      // Error is handled by Redux
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to:
              </p>
              <p className="text-blue-600 font-semibold bg-blue-50 rounded-lg px-4 py-2 mb-6">
                {formData.email}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                If you don't receive the email within a few minutes, please check your spam folder or contact support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4"
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setIsSubmitted(false)}
              >
                Send Another Email
              </Button>
              
              <Link
                to="/login"
                className="block text-center text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Global Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 text-sm font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  success={isEmailValid ? "Valid email address" : null}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                  rightIcon={isEmailValid ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!isEmailValid || loading}
                className="transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
              </Button>
            </form>
          </motion.div>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200 text-center"
          >
            <Link
              to="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Security Notice</h3>
            <p className="text-sm text-gray-600">
              Password reset emails are valid for 24 hours and can only be used once. 
              If you don't receive an email, please contact your system administrator.
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;