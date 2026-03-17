// src/pages/auth/ResetPasswordPage/ResetPasswordPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';

/**
 * Beautiful Reset Password Page
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const { resetPassword, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle(t('resetPassword.title')));
  }, [dispatch, t]);

  const passwordFeedback = useMemo(() => {
    const feedback = [];
    const password = formData.newPassword;

    if (!password) {
      return feedback;
    }

    if (password.length < 8) feedback.push(t('changePassword.req8chars'));
    if (!/[A-Z]/.test(password)) feedback.push(t('changePassword.reqUppercase'));
    if (!/[a-z]/.test(password)) feedback.push(t('changePassword.reqLowercase'));
    if (!/[0-9]/.test(password)) feedback.push(t('changePassword.reqNumber'));
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) feedback.push(t('changePassword.reqSpecial'));

    return feedback;
  }, [formData.newPassword, t]);

  const passwordStrengthScore = useMemo(() => {
    const password = formData.newPassword;
    if (!password) {
      return 0;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    if (score <= 1) return 1;
    if (score <= 2) return 2;
    if (score <= 4) return 3;
    return 4;
  }, [formData.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !formData.token) {
      newErrors.global = t('resetPassword.invalidLinkError');
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('validation.newPasswordRequired');
    } else if (passwordFeedback.length > 0) {
      newErrors.newPassword = passwordFeedback[0];
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmNewPasswordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await resetPassword({
        email: formData.email,
        token: formData.token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (result.payload) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login', {
            state: { message: t('resetPassword.successRedirectMessage') }
          });
        }, 3000);
      }
    } catch {
      // Error is handled by Redux
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score < 2) return 'bg-red-500';
    if (score < 3) return 'bg-yellow-500';
    if (score < 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score < 2) return t('resetPassword.strengthWeak');
    if (score < 3) return t('resetPassword.strengthFair');
    if (score < 4) return t('resetPassword.strengthGood');
    return t('resetPassword.strengthStrong');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
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
                {t('resetPassword.successTitle')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('resetPassword.successMessage')}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-green-800 text-sm font-medium">
                    {t('resetPassword.successSecureNotice')}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link to="/login">
                <Button variant="primary" size="lg" fullWidth>
                  {t('resetPassword.continueSignIn')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -end-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -start-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('resetPassword.title')}
            </h2>
            <p className="text-gray-600">
              {t('resetPassword.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {(!formData.email || !formData.token) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-400 me-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium mb-1">{t('resetPassword.invalidLinkTitle')}</p>
                    <p className="text-yellow-700 text-xs">
                      {t('resetPassword.invalidLinkDesc')}
                    </p>
                    <Link to="/forgot-password" className="inline-block mt-2 text-xs text-yellow-800 font-semibold hover:text-yellow-900 underline">
                      {t('resetPassword.requestNewLink')}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {(error || errors.global) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 me-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 text-sm font-medium">{error || errors.global}</span>
                  </div>
                </motion.div>
              )}

              {formData.email && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <div>
                      <p className="text-blue-800 text-sm font-medium">{t('resetPassword.resettingFor')}</p>
                      <p className="text-blue-600 font-semibold">{formData.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Input
                  type="password"
                  name="newPassword"
                  label={t('resetPassword.newPassword')}
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  disabled={loading || !formData.email || !formData.token}
                  autoComplete="new-password"
                  showPasswordToggle={true}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{t('resetPassword.passwordStrengthLabel')}</span>
                      <span className={`text-xs font-medium ${passwordStrengthScore >= 4 ? 'text-green-600' : passwordStrengthScore >= 3 ? 'text-blue-600' : passwordStrengthScore >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {getPasswordStrengthText(passwordStrengthScore)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrengthScore)}`}
                        style={{ width: `${(passwordStrengthScore / 4) * 100}%` }}
                      />
                    </div>
                    {passwordFeedback.length > 0 && (
                      <ul className="mt-2 text-xs text-gray-600 space-y-1">
                        {passwordFeedback.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-3 h-3 text-gray-400 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  label={t('resetPassword.confirmPassword')}
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  success={formData.confirmPassword && formData.newPassword === formData.confirmPassword ? t('resetPassword.passwordsMatch') : null}
                  disabled={loading || !formData.email || !formData.token}
                  autoComplete="new-password"
                  showPasswordToggle={true}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!formData.email || !formData.token || !formData.newPassword || !formData.confirmPassword || errors.newPassword || errors.confirmPassword || loading}
                className="transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {loading ? t('resetPassword.resettingButton') : t('resetPassword.resetButton')}
              </Button>
            </form>
          </motion.div>

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
              <svg className="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('resetPassword.backToSignIn')}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-3">{t('resetPassword.securityTipsTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('resetPassword.tip1')}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('resetPassword.tip2')}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('resetPassword.tip3')}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('resetPassword.tip4')}
              </div>
            </div>
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

export default ResetPasswordPage;
