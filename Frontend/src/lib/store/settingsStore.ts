import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';

export interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  landingPage: string;
}

export interface SecuritySettingsState {
  loginAlerts: boolean;
  autoLogout: string;
}

export interface NotificationSettingsState {
  txAlerts: boolean;
  highRiskAlerts: boolean;
  emailNotifs: boolean;
  smsNotifs: boolean;
  pushNotifs: boolean;
}

export interface PrivacySettingsState {
  profileVisibility: string;
  activityVisibility: string;
  shareAnalytics: boolean;
  dataRetention: string;
}

export interface DownloadSettingsState {
  statementFormat: string;
  reportFormat: string;
  autoDownload: boolean;
  downloadLocation: string;
}

interface SettingsStore {
  general: GeneralSettings;
  security: SecuritySettingsState;
  notifications: NotificationSettingsState;
  privacy: PrivacySettingsState;
  download: DownloadSettingsState;

  // Actions
  setGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  setSecuritySettings: (settings: Partial<SecuritySettingsState>) => void;
  setNotificationSettings: (settings: Partial<NotificationSettingsState>) => void;
  setPrivacySettings: (settings: Partial<PrivacySettingsState>) => void;
  setDownloadSettings: (settings: Partial<DownloadSettingsState>) => void;

  // Helpers
  getCurrencyCode: () => string;
  formatCurrency: (amount: number, currencyOverride?: string) => string;
  formatDate: (iso: string) => string;
}

const extractCurrencyCode = (currencyStr: string): string => {
  if (currencyStr.includes('INR')) return 'INR';
  if (currencyStr.includes('USD')) return 'USD';
  if (currencyStr.includes('EUR')) return 'EUR';
  if (currencyStr.includes('GBP')) return 'GBP';
  return 'INR';
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      general: {
        language: 'English',
        timezone: '(GMT+05:30) Asia/Kolkata',
        dateFormat: 'DD MMM, YYYY',
        currency: 'INR (₹)',
        landingPage: 'Overview',
      },
      security: {
        loginAlerts: true,
        autoLogout: '15 Minutes',
      },
      notifications: {
        txAlerts: true,
        highRiskAlerts: true,
        emailNotifs: true,
        smsNotifs: false,
        pushNotifs: true,
      },
      privacy: {
        profileVisibility: 'Only Me',
        activityVisibility: 'Only Me',
        shareAnalytics: false,
        dataRetention: '1 Year',
      },
      download: {
        statementFormat: 'PDF',
        reportFormat: 'PDF',
        autoDownload: false,
        downloadLocation: 'Downloads Folder',
      },

      setGeneralSettings: (newSettings) =>
        set((state) => ({ general: { ...state.general, ...newSettings } })),

      setSecuritySettings: (newSettings) =>
        set((state) => ({ security: { ...state.security, ...newSettings } })),

      setNotificationSettings: (newSettings) =>
        set((state) => ({ notifications: { ...state.notifications, ...newSettings } })),

      setPrivacySettings: (newSettings) =>
        set((state) => ({ privacy: { ...state.privacy, ...newSettings } })),

      setDownloadSettings: (newSettings) =>
        set((state) => ({ download: { ...state.download, ...newSettings } })),

      getCurrencyCode: () => {
        return extractCurrencyCode(get().general.currency);
      },

      formatCurrency: (amount: number, currencyOverride?: string) => {
        const code = currencyOverride || extractCurrencyCode(get().general.currency);
        const locale = code === 'INR' ? 'en-IN' : code === 'EUR' ? 'de-DE' : code === 'GBP' ? 'en-GB' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(amount);
      },

      formatDate: (iso: string) => {
        if (!iso) return '';
        const fmt = get().general.dateFormat;
        if (fmt === 'MM/DD/YYYY') return dayjs(iso).format('MM/DD/YYYY, HH:mm');
        if (fmt === 'YYYY-MM-DD') return dayjs(iso).format('YYYY-MM-DD, HH:mm');
        return dayjs(iso).format('DD MMM YYYY, HH:mm');
      },
    }),
    {
      name: 'hawkeye-user-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
