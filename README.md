# MediVault AI 🛡️🏥

> **Intelligent Personal Medical Records Vault, AI Diagnostic Analyzer & Health Tracker**

MediVault AI is a full-stack digital health records management platform designed with an Apple Health / Linear-inspired minimalist aesthetic. It allows individuals and families to securely store, categorize, analyze, compare, and track medical documents and diagnostic reports.

---

## ✨ Key Features

- **Clinical AI Report Analyzer**: Multimodal OCR and structured diagnostic extraction powered by Google Gemini (`gemini-3.8-flash`). Automatically extracts test values, units, laboratory reference ranges, and flags normal, borderline, and out-of-range results.
- **Plain-English Explanations**: Translates complex clinical metrics into understandable language and formulates doctor consultation questions.
- **Historical Report Comparison**: Correlates repeated test parameters across time (e.g., CBC sequences, lipid panels, HbA1c, thyroid screens) with interactive charts featuring shaded reference bands and trajectory tracking.
- **AI Prescription Reader & Medicine Tracker**: Automatically parses handwritten and digital doctor prescriptions into daily dosing schedules (**Morning**, **Afternoon**, **Evening**, **Bedtime**) with 1-click adherence logging and refill supply alerts.
- **Record-Grounded AI Health Assistant**: Conversational health assistant that answers patient questions strictly citing the specific document title and test date.
- **Family Profiles**: Manage separate, private medical vaults for your entire family (Self, Spouse, Children, Parents) under one account.
- **Emergency Medical ID**: Instant life-saving summary with blood group, critical drug allergies, chronic conditions, emergency contact, and an emergency QR code.
- **Bilingual & Dual-Theme**: Fully localized in English and Malayalam (മലയാളം), with crisp Light and Clinical Dark modes.
- **Data Privacy & Portability**: DPDP Act compliant with 1-click JSON data archive export and printable PDF doctor summaries.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Backend**: Node.js, Express, tsx
- **AI / LLM**: `@google/genai` TypeScript SDK using `gemini-3.8-flash`
- **Data Persistence**: File-backed local database store (`/data/medivault-db.json`)
- **Build System**: Vite 8

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/abidsonu/medivault-ai.git
cd medivault-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
# Required for Gemini AI report analysis and chatbot
GEMINI_API_KEY="your-gemini-api-key-here"

# Server configuration
PORT=3000
APP_URL="http://localhost:3000"
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy

MediVault AI is designed around strict medical data handling principles:
- **Tenant Isolation**: Family member profiles maintain isolated medical history.
- **Educational Disclaimer**: MediVault AI provides clinical insights for educational reference and does not replace professional medical diagnosis or treatment.
- **Local / Private Storage**: Records and files are kept in private storage with no public links.

---

## 📄 License
Apache-2.0
