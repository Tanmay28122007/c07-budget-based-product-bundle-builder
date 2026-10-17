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

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <AppLayout>
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'builder' && <BundleBuilderPage />}
      {activeTab === 'chat' && <GeminiChatbotPage />}
      {activeTab === 'catalogue' && <ProductCataloguePage />}
      {activeTab === 'compare' && <CompareBundlesPage />}
      {activeTab === 'tests' && <TestResultsPage />}
      {activeTab === 'business' && <BusinessInsightsPage />}
      {activeTab === 'evidence' && <ProjectEvidencePage />}
      {activeTab === 'settings' && <SettingsPage />}
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
