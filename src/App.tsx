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

import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

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
          {activeTab === 'dashboard' && <DashboardPage />}
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
