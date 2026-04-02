// src/pages/auth/LoginPage/LoginPage.js
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/slices/uiSlice';
import LoginForm from '../../../components/forms/LoginForm/LoginForm';
import LanguageToggle from '../../../components/common/LanguageToggle/LanguageToggle';
import { useTheme } from '../../../hooks/useTheme';
import { AUTH_ENDPOINTS, getFullUrl } from '../../../services/apiEndpoints';
import { getCurrentUser } from '../../../store/slices/authSlice';
import { startTokenRefresh } from '../../../services/apiClient';
import tokenService from '../../../services/tokenService';

/**
 * Beautiful Login Page with animations and professional design
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login, loading, error } = useAuth();
  const passwordChangedSuccess = location.state?.passwordChanged === true;
  const { setThemeMode } = useTheme();
  const { t } = useTranslation('auth');

  useEffect(() => {
    dispatch(setPageTitle(t('login.signIn')));
  }, [dispatch, t]);

  const handleLogin = async (credentials) => {
    try {
      // Route to correct login method
      let result;

      if (credentials.loginMethod === 'ldap') {
        // LDAP login uses username and password
        const ldapCredentials = {
          username: credentials.username,
          password: credentials.password,
          rememberMe: credentials.rememberMe
        };

        console.log('🔐 [LDAP] Starting LDAP authentication...');

        // Dispatch LDAP login command via API
        const apiResponse = await fetch(getFullUrl(AUTH_ENDPOINTS.LDAP_LOGIN), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(ldapCredentials)
        });

        console.log('🔐 [LDAP] API Response Status:', apiResponse.status);

        const data = await apiResponse.json();
        console.log('🔐 [LDAP] API Response Data:', data);

        if (!apiResponse.ok) {
          const errorMsg = data.message || `LDAP login failed: ${apiResponse.statusText}`;
          console.error('❌ [LDAP] API Error:', errorMsg);
          throw new Error(errorMsg);
        }

        // Extract auth response from nested structure
        const authResponse = data.data?.isSuccess ? data.data : data;
        console.log('🔐 [LDAP] Parsed Auth Response:', { isSuccess: authResponse?.isSuccess, hasUser: !!authResponse?.user });

        // Store user info from LDAP response
        const ldapUser = authResponse?.user;
        if (ldapUser && ldapUser.theme) {
          console.log('🎨 [LDAP] Setting theme:', ldapUser.theme);
          setThemeMode(ldapUser.theme);
        }

        // Verify isSuccess before proceeding
        if (!authResponse?.isSuccess) {
          console.error('❌ [LDAP] Authentication response indicated failure');
          throw new Error('LDAP authentication response indicated failure');
        }

        // ✅ Handle LDAP login success - set session and tokens
        console.log('🔐 [LDAP] Handling login success - setting session...');
        tokenService.handleLoginSuccess(authResponse);
        tokenService.updateLastActivity();

        // ✅ CRITICAL: Use backend device fingerprint for refresh token matching
        if (authResponse?.deviceFingerprint) {
          console.log('🔐 [LDAP] Setting backend device fingerprint:', authResponse.deviceFingerprint);
          tokenService.setDeviceFingerprint(authResponse.deviceFingerprint);
        }

        if (credentials.rememberMe && ldapUser?.email) {
          console.log('💾 [LDAP] Remembering email:', ldapUser.email);
          tokenService.rememberEmail(ldapUser.email);
        }

        // ✅ Update Redux auth state with current user info
        try {
          console.log('🔐 [LDAP] Fetching current user to populate Redux state...');
          const getCurrentUserResult = await dispatch(getCurrentUser());

          console.log('🔐 [LDAP] getCurrentUser Result:', {
            hasPayload: !!getCurrentUserResult.payload,
            payloadType: getCurrentUserResult.payload ? typeof getCurrentUserResult.payload : 'null'
          });

          if (getCurrentUserResult.payload) {
            console.log('✅ [LDAP] Redux state updated with current user');

            // ✅ Start token refresh for this session
            console.log('🔄 [LDAP] Starting token refresh service...');
            startTokenRefresh();

            console.log('✅ [LDAP] Authentication successful - navigating to dashboard');

            // Navigate to dashboard
            const from = searchParams.get('from');
            const destination = from ? decodeURIComponent(from) : '/dashboard';
            console.log('🚀 [LDAP] Navigating to:', destination);
            navigate(destination, { replace: true });
            return;
          } else {
            console.error('❌ [LDAP] getCurrentUser returned empty payload:', getCurrentUserResult);
            throw new Error('Failed to load user profile - no payload returned from getCurrentUser');
          }
        } catch (getCurrentUserError) {
          console.error('❌ [LDAP] Error fetching current user:', getCurrentUserError);
          console.error('❌ [LDAP] Error details:', {
            message: getCurrentUserError.message,
            stack: getCurrentUserError.stack
          });
          throw new Error(`Failed to load user profile after LDAP login: ${getCurrentUserError.message}`);
        }
      } else {
        // Standard login
        console.log('📧 [STANDARD] Starting standard email/password authentication...');
        result = await login(credentials);
        console.log('📧 [STANDARD] Login result:', { hasPayload: !!result.payload, isSuccess: result.payload?.loginResponse?.isSuccess });
      }

      // if (result.payload?.loginResponse?.isSuccess) {
      //   // Get intended destination or default based on role
      //   const user = result.payload.user;
      //   console.log('The Results are .........>>:', result)
      //   const from = searchParams.get('from');
      //   const destination = from ? decodeURIComponent(from) : '/dashboard';

      //   console.log('🎨 [STANDARD] Setting theme:', user.theme || 'auto');
      //   setThemeMode(user.theme || 'auto');

      //   console.log('🚀 [STANDARD] Navigating to:', destination);
      //   navigate(destination, { replace: true });
      // }
    } catch (error) {
      // Error is handled by the form and Redux
      console.error('❌ [LOGIN] Login failed with error:', error);
      console.error('❌ [LOGIN] Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-black flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -end-40 w-80 h-80 bg-blue-400 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -start-40 w-80 h-80 bg-purple-400 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 start-40 w-80 h-80 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Language toggle - top right */}
      <div className="absolute top-4 end-4 z-10">
        <LanguageToggle variant="default" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800 p-8 transition-colors duration-300"
        >
          {/* Company Branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('login.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('login.subtitle')}
            </p>
          </motion.div>

          {/* Password changed success banner */}
          {passwordChangedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3"
            >
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('login.passwordChangedSuccess', 'Password changed successfully. Please sign in with your new password.')}
              </p>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
              showRememberMe={true}
              showForgotPassword={true}
            />
          </motion.div>

          {/* Additional Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 space-y-3">
              <div>
                <p className="mb-2">{t('login.noAccount')}</p>
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors hover:underline"
                >
                  {t('login.signUpFree')}
                </Link>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="mb-2">{t('login.troubleAccess')}</p>
                <Link
                  to="/reset-password"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors hover:underline"
                >
                  {t('login.resetPassword')}
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-800"
        >
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('login.needHelp')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {t('login.helpText')}
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <svg className="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t('login.secureLogin')}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('login.trustedPlatform')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <p>{t('login.copyright', { year: new Date().getFullYear() })}</p>
          <p className="mt-1">{t('login.version', { version: '1.0.0' })}</p>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{t('login.signingIn')}</span>
            </div>
          </div>
        </motion.div>
      )}

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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
