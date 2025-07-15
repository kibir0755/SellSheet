# SellSheet Pro - Advanced Profit Calculator

A modern, feature-rich profit calculator for ingredients and products with PWA capabilities. Built with React 19, TypeScript, Vite, and Tailwind CSS.

## ✨ Features

### Core Functionality
- **🧮 Real-time Calculations**: Automatic calculation of total costs, suggested prices, and profit margins
- **📊 Ingredient Management**: Add, edit, and remove ingredients with quantities, units, and costs
- **💡 Smart Profit Margins**: Interactive slider and input for profit margin adjustment (0-1000%)
- **🌙 Dark Mode**: Beautiful light and dark themes with system preference detection

### Advanced Business Analysis
- **🚀 Advanced Mode**: Toggle between simple and comprehensive profit analysis
- **💼 Business Expenses**: Track operating costs, interest, taxes, and other expenses
- **📈 True Net Profit**: Calculate actual net profit margin including all business costs
- **💰 Comprehensive Reporting**: Detailed breakdown of COGS, gross profit, and net profit

### Modern Enhancements
- **💾 Auto-Save**: Automatic data persistence using localStorage
- **📄 PDF Export**: Generate professional PDF reports with ingredient details and calculations
- **📊 CSV Export**: Export data to CSV for spreadsheet analysis
- **✨ Smooth Animations**: Framer Motion powered animations and micro-interactions
- **🎨 Modern UI**: Clean, responsive design with glassmorphism effects
- **📱 Mobile-Friendly**: Fully responsive across all device sizes

### PWA Features (Progressive Web App)
- **📱 Installable App**: Add to home screen on Android/iOS devices
- **🔄 Offline Support**: Works without internet connection
- **⚡ Fast Loading**: Cached resources for instant startup
- **🔔 Smart Install Prompts**: Automatic PWA installation suggestions
- **📡 Network Status**: Offline/online status indicators
- **🏠 Home Screen Integration**: Native app-like experience

### Technical Features
- **⚡ Fast Development**: Vite for lightning-fast development and builds
- **🔧 Type Safety**: Full TypeScript support with proper type definitions
- **🎨 Styling**: Tailwind CSS for utility-first styling
- **📦 Component Architecture**: Well-organized, reusable components
- **🧪 Modern React**: React 19 with hooks and functional components
- **⚙️ Service Worker**: Workbox-powered offline functionality

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## 🛠️ Technologies Used

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **jsPDF** - PDF generation
- **Papa Parse** - CSV parsing and generation
- **Vite PWA Plugin** - Progressive Web App functionality
- **Workbox** - Service worker and offline support

## 📁 Project Structure

```
src/
├── utils/               # Utility functions and calculations
├── constants/           # App constants and configuration
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🎯 Usage

1. **Add Ingredients**: Click "Add Ingredient" to add new ingredients to your calculation
2. **Enter Details**: Fill in ingredient name, quantity, unit, and cost
3. **Set Profit Margin**: Use the slider or input field to set your desired profit margin
4. **Advanced Mode**: Toggle advanced mode for comprehensive business expense analysis
5. **View Results**: See real-time calculations for total cost, suggested price, and profit
6. **Export Data**: Generate PDF reports or CSV files for your records

## 📱 PWA Installation

### Android/Mobile Installation
1. **Open in Chrome/Edge**: Navigate to the app in a mobile browser
2. **Install Prompt**: Look for the "Install App" button or browser install prompt
3. **Add to Home Screen**: Follow browser instructions to add to home screen
4. **Launch**: Open from home screen for native app experience

### Desktop Installation
1. **Open in Chrome/Edge**: Navigate to the app in browser
2. **Install Icon**: Look for install icon in address bar or app menu
3. **Install**: Click install to add to desktop/apps menu
4. **Offline**: App works completely offline after installation

### PWA Benefits
- ⚡ **Instant Loading**: Cached app loads immediately
- 🔄 **Offline Access**: Full functionality without internet
- 📱 **Native Feel**: App-like experience with native UI
- 🏠 **Home Screen**: Direct access from device home screen
- 🔔 **Background Updates**: Automatic app updates when online

## 🌟 Key Improvements Made

### UI/UX Enhancements
- ✅ Complete UI redesign with modern glassmorphism effects
- ✅ Improved form inputs with proper labels and validation
- ✅ Interactive profit margin slider with visual feedback
- ✅ Gradient backgrounds and modern color schemes
- ✅ Smooth animations and hover effects
- ✅ Advanced mode toggle for comprehensive analysis

### PWA Integration
- ✅ Progressive Web App with full offline support
- ✅ Installable on Android/iOS home screens
- ✅ Service worker with Workbox for caching
- ✅ Smart install prompts and network status
- ✅ Native app-like experience

### Advanced Features
- ✅ True net profit margin calculations
- ✅ Business expense tracking and analysis
- ✅ Comprehensive profit breakdown (COGS, gross, net)
- ✅ Advanced/simple mode toggle

### Functionality Enhancements
- ✅ Working PDF export with professional formatting
- ✅ Working CSV export with complete data
- ✅ Data persistence across browser sessions
- ✅ Better ingredient validation
- ✅ Improved calculation accuracy

### Code Quality
- ✅ TypeScript integration with proper types
- ✅ Modular component architecture
- ✅ Utility functions for calculations
- ✅ Constants file for configuration
- ✅ Clean, maintainable code structure

## 🐛 Bug Fixes

- ✅ Fixed missing type definitions for papaparse
- ✅ Enabled previously disabled export features
- ✅ Improved dark mode implementation
- ✅ Fixed responsive design issues
- ✅ Enhanced accessibility

## 🔮 Future Enhancements

- [ ] Recipe management and saving
- [ ] Multiple currency support
- [ ] Batch ingredient import
- [ ] Cost tracking over time
- [ ] Supplier management
- [ ] Enhanced native mobile features (Push notifications, etc.)
- [ ] Cloud sync and backup
- [ ] Multi-language support

---

**Powered by SellSheet Pro** - Professional profit calculations with PWA technology.

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
