"use client";

import React from 'react';
import { AuthProvider } from '@context/AuthContext';
import { DataProvider } from '@context/DataContext';
import { ToastProvider } from '@context/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
