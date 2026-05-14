import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getApiKeyRequest,
  getCurrentProfile,
  getSettingsRequest,
  loginRequest,
  signupRequest,
  storageKeys,
  updateSettingsRequest,
} from '../api';

const AuthContext = createContext(null);

function safeStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function readToken() {
  return safeStorage()?.getItem(storageKeys.accessToken) ?? null;
}

function readApiKey() {
  return safeStorage()?.getItem(storageKeys.apiKey) ?? null;
}

function writeSession(token, apiKey = null) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  storage.setItem(storageKeys.accessToken, token);
  if (apiKey) {
    storage.setItem(storageKeys.apiKey, apiKey);
  }
}

function clearSession() {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(storageKeys.accessToken);
  storage.removeItem(storageKeys.apiKey);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => readToken());
  const [apiKey, setApiKey] = useState(() => readApiKey());
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const resetSession = useCallback(() => {
    clearSession();
    setAccessToken(null);
    setApiKey(null);
    setUser(null);
    setSettings(null);
  }, []);

  const hydrateSession = useCallback(async (token = readToken()) => {
    if (!token) {
      resetSession();
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      writeSession(token, readApiKey());
      setAccessToken(token);

      const [profile, settingsResponse, apiKeyResponse] = await Promise.all([
        getCurrentProfile(),
        getSettingsRequest().catch(() => null),
        getApiKeyRequest().catch(() => null),
      ]);

      setUser(profile);
      setSettings(settingsResponse);

      if (apiKeyResponse?.api_key) {
        writeSession(token, apiKeyResponse.api_key);
        setApiKey(apiKeyResponse.api_key);
      }
    } catch (requestError) {
      resetSession();
      setError(requestError?.response?.data?.detail || 'Your session expired. Please sign in again.');
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [resetSession]);

  useEffect(() => {
    hydrateSession().catch(() => {
      // The error state is already set in hydrateSession.
    });
  }, [hydrateSession]);

  const signIn = useCallback(async ({ email, password }) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await loginRequest({ email, password });
      await hydrateSession(response.access_token);
      return response;
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'Unable to sign in. Please check your credentials.');
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  }, [hydrateSession]);

  const signUp = useCallback(async ({ username, email, password }) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await signupRequest({ username, email, password });
      await hydrateSession(response.access_token);
      return response;
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'Unable to create your account.');
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  }, [hydrateSession]);

  const signOut = useCallback(() => {
    resetSession();
    setError(null);
    setLoading(false);
  }, [resetSession]);

  const refreshSession = useCallback(async () => {
    await hydrateSession(accessToken || readToken());
  }, [accessToken, hydrateSession]);

  const refreshSettings = useCallback(async (payload) => {
    setSubmitting(true);
    setError(null);

    try {
      const updatedSettings = await updateSettingsRequest(payload);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'Unable to update settings.');
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const value = useMemo(() => ({
    accessToken,
    apiKey,
    user,
    settings,
    error,
    loading,
    submitting,
    isAuthenticated: Boolean(accessToken && user),
    signIn,
    signUp,
    signOut,
    refreshSession,
    refreshSettings,
    setError,
  }), [accessToken, apiKey, error, loading, refreshSession, refreshSettings, signIn, signOut, signUp, settings, submitting, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}