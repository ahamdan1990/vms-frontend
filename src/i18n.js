// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English namespaces
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enNavigation from './locales/en/navigation.json';
import enInvitations from './locales/en/invitations.json';
import enVisitors from './locales/en/visitors.json';
import enCheckin from './locales/en/checkin.json';
import enDashboard from './locales/en/dashboard.json';
import enUsers from './locales/en/users.json';
import enSystem from './locales/en/system.json';
import enReports from './locales/en/reports.json';
import enNotifications from './locales/en/notifications.json';
import enErrors from './locales/en/errors.json';

// Arabic namespaces
import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arNavigation from './locales/ar/navigation.json';
import arInvitations from './locales/ar/invitations.json';
import arVisitors from './locales/ar/visitors.json';
import arCheckin from './locales/ar/checkin.json';
import arDashboard from './locales/ar/dashboard.json';
import arUsers from './locales/ar/users.json';
import arSystem from './locales/ar/system.json';
import arReports from './locales/ar/reports.json';
import arNotifications from './locales/ar/notifications.json';
import arErrors from './locales/ar/errors.json';

const LANGUAGE_KEY = 'vms_language_preference';

const getStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch (_) {}
  // Auto-detect from browser
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  return browserLang.startsWith('ar') ? 'ar' : 'en';
};

const storedLang = getStoredLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        navigation: enNavigation,
        invitations: enInvitations,
        visitors: enVisitors,
        checkin: enCheckin,
        dashboard: enDashboard,
        users: enUsers,
        system: enSystem,
        reports: enReports,
        notifications: enNotifications,
        errors: enErrors
      },
      ar: {
        common: arCommon,
        auth: arAuth,
        navigation: arNavigation,
        invitations: arInvitations,
        visitors: arVisitors,
        checkin: arCheckin,
        dashboard: arDashboard,
        users: arUsers,
        system: arSystem,
        reports: arReports,
        notifications: arNotifications,
        errors: arErrors
      }
    },
    lng: storedLang,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common', 'auth', 'navigation', 'invitations',
      'visitors', 'checkin', 'dashboard', 'users',
      'system', 'reports', 'notifications', 'errors'
    ],
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Apply direction to <html> on init
const applyDirection = (lang) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
};

applyDirection(storedLang);

// Re-apply when language changes
i18n.on('languageChanged', (lang) => {
  applyDirection(lang);
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch (_) {}
});

export { LANGUAGE_KEY };
export default i18n;
