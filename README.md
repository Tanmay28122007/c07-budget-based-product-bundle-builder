# Budget-Based Product Bundle Builder

An intelligent, full-stack enterprise workstation bundle configuration platform that enables shoppers and procurement managers to assemble 100% compatible product bundles tailored strictly to their target budget.

---

## 🌟 Key Features

- **Automated Bundle Assembly**: Dynamic slot assignment across chairs, desks, monitors, lamps, and docking stations with constraint satisfaction.
- **3-View Compare Builder**: Segmented switcher with Bundle Workspace (custom slot assembly & landed cost breakdown), Compare Bundles (side-by-side spec & pricing matrix), and Bundle Recommendations (25 pre-configured, valid workstation setups).
- **Interactive Checkout & Payment Flow**: Integrated Buy Now buttons connecting bundles directly to an order checkout page with dynamic pricing, address validation, multi-rail payment methods (UPI, Cards, Net Banking, COD), and demo receipt generation.
- **Comprehensive 60-Product Catalog**: 60 specialized products (P01–P60) covering 9 industry workstation setups (Software Engineering, Data Science, Creative Design, Audio/Video Production, Trading, Ergonomics, and more).
- **Hardware Compatibility Engine**: Real-time cross-category validation (e.g., monitor clamp lights vs curved bezels, desk width overhangs, and USB-C dock power delivery).
- **Landed Pricing Intelligence**: Accurate calculation of product subtotal, weight-tiered shipping surcharges, free delivery thresholds, and GST taxation.
- **Unit Economics & MBA Analytics**: Real-time referral revenue, margin modeling, customer budget feasibility scores, and platform monetization telemetry.
- **Context-Aware AI Bundle Assistant**: Integrated multi-turn Gemini-powered consultant providing tailored hardware advice and setup optimization.
- **Role-Based Workspaces**: Separate intuitive workflows for Shoppers (Customer Portal) and Catalog Managers (Admin Overview).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion
- **Icons & Typography**: Lucide React, Playfair Display & Inter
- **Backend / Dev Server**: Node.js, Express, Vite 8, `tsx`
- **AI Engine**: Gemini API (`@google/genai`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
GEMINI_API_KEY="your_api_key_here"
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📄 License
MIT License
