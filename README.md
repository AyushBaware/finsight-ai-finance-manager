# FinSight - AI-Powered Personal Finance Management

A modern, intelligent financial management web application that combines expense tracking, smart analytics, and AI-driven financial advice to help you manage your money better.

![FinSight](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-blue) ![Firebase](https://img.shields.io/badge/Firebase-12-orange) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4)

## ✨ Key Features

### 💰 Expense Management
- **Quick Add** - Add expenses instantly with intuitive interface
- **Voice-to-Expense** - Convert voice commands to expenses with automatic categorization
- **Smart Categorization** - Expenses auto-categorized into 8+ categories
- **Search & Filter** - Find expenses by category or keywords
- **Real-time Sync** - Automatic cloud sync across devices

### 📊 Analytics & Insights
- **Dashboard Overview** - Real-time view of income, expenses, and savings rate
- **Category Breakdown** - Visual charts showing expense distribution
- **Weekly Analysis** - Expense trends by week within current month
- **Smart Expense Analyzer** - AI-powered analysis of spending patterns

### 🤖 AI-Powered Financial Advisor
- **Smart Money Allocation** - Intelligent recommendations for leftover money
- **Investment Recommendations** - Personalized investment suggestions based on risk tolerance
- **Financial Goal Planner** - Create and track financial goals
- **Investment Simulator** - Test investment scenarios with projections
- **Wealth Projection Calculator** - Predict long-term wealth growth
- **Lifestyle Expense Tracker** - Track discretionary vs essential spending
- **Personalized Financial Advisor** - AI chatbot for financial queries

### 🎯 Additional Tools
- **Risk Assessment** - Evaluate your investment risk tolerance
- **Budget Planning** - Set monthly income targets and track savings goals
- **Multi-Category Support** - Food & Dining, Transport, Shopping, Entertainment, Utilities, Healthcare, Subscriptions, and more
- **Data Export** - Download and backup your financial data
- **Theme Customization** - Dark/Light mode with multiple theme options

### 📱 User Experience
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Offline Support** - PWA with offline capability and local persistence
- **Multi-Tab Sync** - Firestore persistence syncs across browser tabs
- **Intuitive Navigation** - Sidebar and bottom navigation for easy access
- **Toast Notifications** - Real-time feedback on all actions

## 🚀 Technology Stack

- **Frontend Framework** - React 19
- **Build Tool** - Vite 7
- **Backend** - Firebase (Authentication + Firestore)
- **Styling** - Tailwind CSS 4
- **Charts & Visualization** - Recharts
- **Icons** - Lucide React, React Icons
- **Routing** - React Router DOM
- **PWA** - Vite PWA Plugin
- **HTTP Client** - Axios

## 📋 Project Structure

`
src/
├── components/
│   ├── common/          # Reusable components (AI advisors, expense widgets)
│   ├── layout/          # App layout (header, sidebar, navigation)
│   └── ui/              # Basic UI components (buttons, inputs, modals)
├── pages/               # Page components (Dashboard, Analytics, etc.)
├── context/             # React Context (Expenses, Theme state)
├── hooks/               # Custom React hooks (voice-to-expense parsing)
├── services/            # Business logic (AI, data, theme, settings)
├── utils/               # Utilities (toast notifications)
└── main.jsx             # App entry point
`

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Steps

1. **Clone the repository**
   `bash
   git clone https://github.com/yourusername/finSight.git
   cd finSight-main
   `

2. **Install dependencies**
   `bash
   npm install
   `

3. **Environment Setup**
   - Firebase config is pre-configured in src/firebase.js
   - No additional .env file needed for basic setup

4. **Start development server**
   `bash
   npm run dev
   `
   The app will be available at http://localhost:5173

5. **Build for production**
   `bash
   npm run build
   `

6. **Preview production build**
   `bash
   npm run preview
   `

## 🔐 Authentication

- **Google Sign-In** - Sign in with your Google account
- **Firebase Authentication** - Secure, managed authentication
- **Session Persistence** - Stay logged in across browser sessions

## 💾 Data Storage

- **Cloud Storage** - Firestore for real-time data sync
- **Offline Persistence** - IndexedDB for offline access
- **Multi-Tab Support** - Automatic sync across browser tabs
- **Data Privacy** - Only your authenticated account accesses your data

## 🎨 Themes & Customization

**Available Themes:**
- Light Mode
- Dark Mode
- System Preference (auto-detect)

Access theme settings in the **Settings** page to customize your experience.

## 📊 Pages Overview

| Page | Purpose |
|------|---------|
| **Dashboard** | Quick financial overview, recent expenses, AI suggestions |
| **Expenses** | Manage, view, and analyze all expenses with search & filter |
| **Analytics** | Detailed charts, trends, investment simulations, wealth projections |
| **Categories** | View and manage expense categories |
| **Settings** | Profile, theme, import/export data, financial preferences |
| **Add Expense** | Detailed expense creation with all details |

## 🔄 Workflow Examples

### Log an Expense (Voice)
1. Click **Voice Recorder** button
2. Say: "Spent 50 rupees at Starbucks for lunch"
3. System auto-detects: Amount, Merchant, Category, Note
4. Confirm and save

### Check Financial Health
1. Go to **Dashboard**
2. View: Total expenses, savings rate, leftover money
3. Read AI suggestions for money allocation and investments

### Plan Investments
1. Go to **Analytics**
2. Use **Investment Simulator** to test scenarios
3. Check **Wealth Projection Calculator** for long-term goals
4. Review **Financial Goal Planner** recommendations

## 🔗 API Integration

- **Firebase Authentication API** - User login and session management
- **Firestore Database API** - Real-time expense data storage
- **Firestore Offline Persistence** - Local caching and sync

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Deploy to Vercel (Recommended)
`ash
npm install -g vercel
vercel
`

### Deploy to Netlify
`ash
npm run build
# Upload dist/ folder to Netlify
`

### Deploy to Firebase Hosting
`ash
npm install -g firebase-tools
firebase init
firebase deploy
`

## 📝 Available Scripts

`ash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint checks
`

## 🤝 Features in Development

- [ ] Recurring expense management
- [ ] Bill reminders
- [ ] Budget alerts
- [ ] Export to PDF/Excel
- [ ] Collaborative budgeting
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

**Issue: Expenses not syncing**
- Check internet connection
- Verify Firebase is connected (check console)
- Try refreshing the page

**Issue: Voice recognition not working**
- Ensure microphone permissions are granted
- Use Chrome or Edge for best support
- Speak clearly and naturally

**Issue: Offline mode issues**
- Clear browser cache and try again
- Check browser storage quota
- Disable browser extensions that block storage

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

**Made with ❤️ for better financial management**
