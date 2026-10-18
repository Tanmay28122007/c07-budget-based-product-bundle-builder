/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { BundleBuilderPage } from './components/builder/BundleBuilderPage';
import { ProductCataloguePage } from './components/catalogue/ProductCataloguePage';
import { CompareBundlesPage } from './components/compare/CompareBundlesPage';
import { TestResultsPage } from './components/tests/TestResultsPage';
import { BusinessInsightsPage } from './components/business/BusinessInsightsPage';
import { ProjectEvidencePage } from './components/evidence/ProjectEvidencePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { GeminiChatbotPage } from './components/chat/GeminiChatbotPage';
import { ProductDetailPage } from './components/catalogue/ProductDetailPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { LoginPage } from './components/auth/LoginPage';

import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { activeTab, userRole } = useApp();

  // If user is not authenticated or explicitly on login/home page, display LoginPage
  if (!userRole || activeTab === 'login' || activeTab === 'home') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login-page"
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <LoginPage />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {(activeTab === 'dashboard' || activeTab === 'signin' || activeTab === 'login') && <DashboardPage />}
          {activeTab === 'builder' && <CompareBundlesPage initialMode="workspace" />}
          {activeTab === 'chat' && <GeminiChatbotPage />}
          {activeTab === 'catalogue' && <ProductCataloguePage />}
          {activeTab === 'product-detail' && <ProductDetailPage />}
          {activeTab === 'compare' && <CompareBundlesPage />}
          {activeTab === 'tests' && <TestResultsPage />}
          {activeTab === 'business' && <BusinessInsightsPage />}
          {activeTab === 'evidence' && <ProjectEvidencePage />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'checkout' && <CheckoutPage />}
          {/* Fallback for unknown or legacy 'landing' tab */}
          {(!['dashboard', 'signin', 'login', 'builder', 'chat', 'catalogue', 'product-detail', 'compare', 'tests', 'business', 'evidence', 'settings', 'profile', 'checkout'].includes(activeTab)) && <ProductCataloguePage />}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
