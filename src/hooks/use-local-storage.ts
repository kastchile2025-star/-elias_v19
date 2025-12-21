"use client";

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            setStoredValue(parsed);
          } catch (parseError) {
            console.error(`Error parsing localStorage key "${key}":`, parseError);
            // Si hay un error de parsing, limpiar el valor corrupto
            window.localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error(`Error accessing localStorage for key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}

export function useLocalStorageString(key: string, initialValue: string = ''): [string, (value: string) => void, boolean] {
  const [storedValue, setStoredValue] = useState<string>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          // Para strings, no necesitamos JSON.parse
          setStoredValue(item);
        }
      }
    } catch (error) {
      console.error(`Error accessing localStorage for key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = (value: string) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}
