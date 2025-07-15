import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Trash2, Plus, Sun, Moon, Calculator, DollarSign, Smartphone, Wifi } from "lucide-react";
import jsPDF from "jspdf";
import Papa from "papaparse";
import autoTable from "jspdf-autotable";
import { 
  calculateTotalCost, 
  calculateSuggestedPrice, 
  calculateComprehensiveProfitAnalysis,
  getDefaultIngredient,
  getDefaultBusinessExpenses,
  validateIngredient,
  formatCurrency,
  formatPercentage,
  type Ingredient,
  type BusinessExpenses
} from "./utils/calculations";
import { 
  UNITS, 
  DEFAULT_MARGIN, 
  MAX_MARGIN, 
  MIN_MARGIN, 
  STORAGE_KEY,
  APP_NAME,
  APP_TAGLINE
} from "./constants";

function IngredientInput({
  ingredient,
  onChange,
  onRemove,
  canRemove,
}: {
  ingredient: Ingredient;
  onChange: (key: keyof Ingredient, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 rounded-2xl p-6 mb-6 shadow-xl hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Card Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            🥄 Ingredient
          </label>
          <input
            className="w-full bg-white/50 dark:bg-zinc-900/50 border-2 border-zinc-300/50 dark:border-zinc-600/50 rounded-xl py-3 px-4 text-base font-medium outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-900 transition-all duration-200 dark:text-white placeholder-zinc-400"
            placeholder="e.g., Flour"
            value={ingredient.name}
            onChange={e => onChange("name", e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            📏 Quantity
          </label>
          <input
            type="number"
            className="w-full bg-white/50 dark:bg-zinc-900/50 border-2 border-zinc-300/50 dark:border-zinc-600/50 rounded-xl py-3 px-4 text-right outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-900 transition-all duration-200 dark:text-white placeholder-zinc-400"
            min={0}
            step="0.01"
            placeholder="0"
            value={ingredient.quantity || ''}
            onChange={e => onChange("quantity", Number(e.target.value))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            📦 Unit
          </label>
          <select
            className="w-full bg-white/50 dark:bg-zinc-900/50 border-2 border-zinc-300/50 dark:border-zinc-600/50 rounded-xl py-3 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-900 transition-all duration-200 dark:text-white"
            value={ingredient.unit}
            onChange={e => onChange("unit", e.target.value)}
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            💰 Cost ($)
          </label>
          <input
            type="number"
            className="w-full bg-white/50 dark:bg-zinc-900/50 border-2 border-zinc-300/50 dark:border-zinc-600/50 rounded-xl py-3 px-4 text-right outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-900 transition-all duration-200 dark:text-white placeholder-zinc-400"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={ingredient.cost || ''}
            onChange={e => onChange("cost", Number(e.target.value))}
          />
        </div>
      </div>
      
      {canRemove && (
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-2 w-10 h-10 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-10"
          onClick={onRemove}
          title="Remove ingredient"
        >
          <Trash2 size={16} />
        </motion.button>
      )}
      
      <div className="mt-6 p-4 bg-gradient-to-r from-zinc-50 to-blue-50/50 dark:from-zinc-900 dark:to-zinc-800 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {ingredient.cost && ingredient.quantity ? (
            <div className="flex justify-between items-center">
              <span>
                Total: <span className="font-semibold text-zinc-800 dark:text-zinc-200">${ingredient.cost.toFixed(2)}</span>
              </span>
              <span>
                Per {ingredient.unit}: <span className="font-semibold text-zinc-800 dark:text-zinc-200">${(ingredient.cost / ingredient.quantity).toFixed(2)}</span>
              </span>
            </div>
          ) : (
            <span className="text-zinc-500">Enter cost & quantity to see calculations</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([getDefaultIngredient()]);
  const [margin, setMargin] = useState(DEFAULT_MARGIN);
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(0);
  const [businessExpenses, setBusinessExpenses] = useState<BusinessExpenses>(getDefaultBusinessExpenses());
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [dark, setDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // PWA state
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check if app is installed
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone;
    setIsInstalled(isStandalone || isInWebApp);
  }, []);

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after 10 seconds if not installed
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 10000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Check if install prompt was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < dayInMs) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.margin) setMargin(data.margin);
        if (data.customSellingPrice) setCustomSellingPrice(data.customSellingPrice);
        if (data.businessExpenses) setBusinessExpenses(data.businessExpenses);
        if (data.showAdvancedMode !== undefined) setShowAdvancedMode(data.showAdvancedMode);
      } catch (error) {
        console.warn('Failed to load saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    const data = { ingredients, margin, customSellingPrice, businessExpenses, showAdvancedMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [ingredients, margin, customSellingPrice, businessExpenses, showAdvancedMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Calculation logic using comprehensive profit analysis
  const totalCost = calculateTotalCost(ingredients);
  const suggestedPrice = calculateSuggestedPrice(totalCost, margin);
  
  // Use custom selling price in advanced mode, suggested price in simple mode
  const actualSellingPrice = showAdvancedMode ? customSellingPrice : suggestedPrice;
  const profitAnalysis = calculateComprehensiveProfitAnalysis(ingredients, actualSellingPrice, businessExpenses);

  // Auto-set custom selling price when switching to advanced mode if it's 0
  useEffect(() => {
    if (showAdvancedMode && customSellingPrice === 0) {
      setCustomSellingPrice(suggestedPrice);
    }
  }, [showAdvancedMode, suggestedPrice, customSellingPrice]);

  const updateIngredient = (idx: number, key: keyof Ingredient, value: string | number) => {
    setIngredients(ings => {
      const updated = [...ings];
      updated[idx] = { ...updated[idx], [key]: value };
      return updated;
    });
  };

  const updateBusinessExpense = (key: keyof BusinessExpenses, value: number) => {
    setBusinessExpenses(prev => ({ ...prev, [key]: value }));
  };

  const addIngredient = () =>
    setIngredients(ings => [...ings, getDefaultIngredient()]);

  const removeIngredient = (idx: number) =>
    setIngredients(ings => ings.length === 1 ? ings : ings.filter((_, i) => i !== idx));

  // PWA Install functionality
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`${APP_NAME} ${APP_TAGLINE}`, 20, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Comprehensive Profit Analysis
    doc.setFontSize(14);
    doc.text('Revenue & Cost Analysis', 20, 65);
    doc.setFontSize(10);
    doc.text(`Total Revenue: ${formatCurrency(profitAnalysis.totalRevenue)}`, 20, 75);
    doc.text(`Cost of Goods Sold (COGS): ${formatCurrency(profitAnalysis.cogs)}`, 20, 85);
    doc.text(`Gross Profit: ${formatCurrency(profitAnalysis.grossProfit)} (${formatPercentage(profitAnalysis.grossProfitMargin)})`, 20, 95);
    
    if (showAdvancedMode) {
      doc.text(`Operating Expenses: ${formatCurrency(businessExpenses.operatingExpenses)}`, 20, 105);
      doc.text(`Interest Expenses: ${formatCurrency(businessExpenses.interestExpenses)}`, 20, 115);
      doc.text(`Taxes: ${formatCurrency(businessExpenses.taxes)}`, 20, 125);
      doc.text(`Other Expenses: ${formatCurrency(businessExpenses.otherExpenses)}`, 20, 135);
      doc.text(`Total Expenses: ${formatCurrency(profitAnalysis.totalExpenses)}`, 20, 145);
      doc.text(`Net Profit: ${formatCurrency(profitAnalysis.netProfit)} (${formatPercentage(profitAnalysis.netProfitMargin)})`, 20, 155);
    } else {
      doc.text(`Profit Margin: ${margin}%`, 20, 105);
    }
    
    // Table data - only include valid ingredients
    const validIngredients = ingredients.filter(validateIngredient);
    const tableData = validIngredients.map(ing => [
      ing.name,
      ing.quantity.toString(),
      ing.unit,
      formatCurrency(ing.cost),
      formatCurrency(ing.cost / ing.quantity)
    ]);
    
    // Create table
    autoTable(doc, {
      startY: showAdvancedMode ? 170 : 120,
      head: [['Ingredient', 'Quantity', 'Unit', 'Total Cost', 'Cost per Unit']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save(`${APP_NAME.toLowerCase()}-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const validIngredients = ingredients.filter(validateIngredient);
    const csvData = [
      [`${APP_NAME} ${APP_TAGLINE} Export`],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['Profit Analysis'],
      ['Total Revenue:', formatCurrency(profitAnalysis.totalRevenue)],
      ['Cost of Goods Sold (COGS):', formatCurrency(profitAnalysis.cogs)],
      ['Gross Profit:', formatCurrency(profitAnalysis.grossProfit)],
      ['Gross Profit Margin:', formatPercentage(profitAnalysis.grossProfitMargin)],
    ];

    if (showAdvancedMode) {
      csvData.push(
        [''],
        ['Business Expenses'],
        ['Operating Expenses:', formatCurrency(businessExpenses.operatingExpenses)],
        ['Interest Expenses:', formatCurrency(businessExpenses.interestExpenses)],
        ['Taxes:', formatCurrency(businessExpenses.taxes)],
        ['Other Expenses:', formatCurrency(businessExpenses.otherExpenses)],
        ['Total Expenses:', formatCurrency(profitAnalysis.totalExpenses)],
        ['Net Profit:', formatCurrency(profitAnalysis.netProfit)],
        ['Net Profit Margin:', formatPercentage(profitAnalysis.netProfitMargin)]
      );
    } else {
      csvData.push(['Profit Margin:', `${margin}%`]);
    }

    csvData.push(
      [''],
      ['Ingredients'],
      ['Name', 'Quantity', 'Unit', 'Total Cost', 'Cost per Unit'],
      ...validIngredients.map(ing => [
        ing.name,
        ing.quantity.toString(),
        ing.unit,
        ing.cost.toFixed(2),
        (ing.cost / ing.quantity).toFixed(2)
      ])
    );
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${APP_NAME.toLowerCase()}-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-900 transition-all duration-500 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-700/50 p-8 mb-8 relative overflow-hidden">
            {/* Header Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Calculator className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                    {APP_NAME}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">{APP_TAGLINE}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {showInstallPrompt && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstallApp}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg text-sm"
                    title="Install as Android App"
                  >
                    📱 Install App
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdvancedMode(!showAdvancedMode)}
                  className={`px-6 py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg ${
                    showAdvancedMode 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' 
                      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-white hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-600'
                  }`}
                  title="Toggle advanced profit analysis"
                >
                  {showAdvancedMode ? '✨ Simple Mode' : '🚀 Advanced Mode'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDark(d => !d)}
                  className="p-3 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 rounded-2xl transition-all duration-300 border border-zinc-200 dark:border-zinc-600 shadow-lg"
                  title="Toggle dark mode"
                >
                  {dark ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-indigo-600" />}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-700/50 p-8 relative overflow-hidden">
                {/* Section Background Accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                      <div className="text-2xl">🧪</div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                      Ingredients
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={addIngredient}
                  >
                    <Plus size={20} />
                    Add Ingredient
                  </motion.button>
                </div>
                
                <AnimatePresence>
                  {ingredients.map((ingredient, idx) => (
                    <IngredientInput
                      key={idx}
                      ingredient={ingredient}
                      canRemove={ingredients.length > 1}
                      onChange={(key, value) => updateIngredient(idx, key, value)}
                      onRemove={() => removeIngredient(idx)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Summary & Controls */}
            <div className="space-y-6">
              {/* Advanced Mode Toggle Info */}
              {showAdvancedMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
                  <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2 text-lg">
                    🚀 Advanced Profit Analysis
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    This mode calculates true net profit margin by including all business expenses 
                    (operating costs, interest, taxes, etc.) as per standard accounting practices.
                    You can set your own selling price to see how it affects your profit margins.
                  </p>
                </motion.div>
              )}

              {/* Business Expenses (Advanced Mode) */}
              {showAdvancedMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-700/50 p-8 relative overflow-hidden"
                >
                  {/* Section Background Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                      <div className="text-2xl">💼</div>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                      Selling Price & Business Expenses
                    </h3>
                  </div>
                  
                  {/* Selling Price Input */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-lg"></div>
                    <label className="block text-sm font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                      💰 Selling Price ($)
                    </label>
                    <input
                      type="number"
                      className="w-full border-2 border-blue-300/50 dark:border-blue-600/50 bg-white/80 dark:bg-zinc-800/80 rounded-xl px-4 py-3 text-right font-mono text-xl focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 dark:text-white shadow-lg"
                      placeholder="0.00"
                      value={customSellingPrice || ''}
                      min={0}
                      step="0.01"
                      onChange={e => setCustomSellingPrice(Number(e.target.value))}
                    />
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 font-medium">
                      Set your desired selling price to calculate true profit margins
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                        🏢 Operating Expenses ($)
                      </label>
                      <input
                        type="number"
                        className="w-full border-2 border-zinc-300/50 dark:border-zinc-600/50 bg-white/80 dark:bg-zinc-800/80 rounded-xl px-4 py-3 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 dark:text-white shadow-lg"
                        placeholder="Rent, salaries, marketing..."
                        value={businessExpenses.operatingExpenses || ''}
                        min={0}
                        step="0.01"
                        onChange={e => updateBusinessExpense('operatingExpenses', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                        📊 Interest Expenses ($)
                      </label>
                      <input
                        type="number"
                        className="w-full border-2 border-zinc-300/50 dark:border-zinc-600/50 bg-white/80 dark:bg-zinc-800/80 rounded-xl px-4 py-3 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 dark:text-white shadow-lg"
                        placeholder="Loan interest, credit cards..."
                        value={businessExpenses.interestExpenses || ''}
                        min={0}
                        step="0.01"
                        onChange={e => updateBusinessExpense('interestExpenses', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                        🏛️ Taxes ($)
                      </label>
                      <input
                        type="number"
                        className="w-full border-2 border-zinc-300/50 dark:border-zinc-600/50 bg-white/80 dark:bg-zinc-800/80 rounded-xl px-4 py-3 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 dark:text-white shadow-lg"
                        placeholder="Business taxes..."
                        value={businessExpenses.taxes || ''}
                        min={0}
                        step="0.01"
                        onChange={e => updateBusinessExpense('taxes', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                        📋 Other Expenses ($)
                      </label>
                      <input
                        type="number"
                        className="w-full border-2 border-zinc-300/50 dark:border-zinc-600/50 bg-white/80 dark:bg-zinc-800/80 rounded-xl px-4 py-3 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 dark:text-white shadow-lg"
                        placeholder="Miscellaneous costs..."
                        value={businessExpenses.otherExpenses || ''}
                        min={0}
                        step="0.01"
                        onChange={e => updateBusinessExpense('otherExpenses', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Profit Margin Control (Simple Mode) */}
              {!showAdvancedMode && (
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-700/50 p-8 relative overflow-hidden">
                  {/* Section Background Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                      Profit Margin
                    </h3>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <input
                      type="range"
                      className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                      min={MIN_MARGIN}
                      max={MAX_MARGIN}
                      value={margin}
                      onChange={e => setMargin(Number(e.target.value))}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        className="flex-1 border-2 border-zinc-300/50 dark:border-zinc-600/50 bg-white/80 dark:bg-zinc-800/80 rounded-xl px-4 py-3 text-right font-mono text-xl focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 dark:text-white shadow-lg"
                        value={margin}
                        min={MIN_MARGIN}
                        max={MAX_MARGIN}
                        onChange={e => setMargin(Number(e.target.value))}
                      />
                      <span className="text-xl font-bold text-zinc-600 dark:text-zinc-400">%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="space-y-6">
                {/* Revenue Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-blue-100 text-sm font-semibold mb-2 flex items-center gap-2">
                        📊 {showAdvancedMode ? 'Selling Price' : 'Suggested Price'}
                      </p>
                      <p className="text-4xl font-bold mb-1">{formatCurrency(profitAnalysis.totalRevenue)}</p>
                      {showAdvancedMode && (
                        <p className="text-blue-200 text-xs">Based on your custom price</p>
                      )}
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* COGS Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-orange-100 text-sm font-semibold mb-2 flex items-center gap-2">
                        📦 Cost of Goods Sold
                      </p>
                      <p className="text-4xl font-bold">{formatCurrency(profitAnalysis.cogs)}</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Gross Profit Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-green-100 text-sm font-semibold mb-2 flex items-center gap-2">
                        💚 Gross Profit
                      </p>
                      <p className="text-4xl font-bold mb-1">{formatCurrency(profitAnalysis.grossProfit)}</p>
                      <p className="text-green-200 text-sm font-medium">{formatPercentage(profitAnalysis.grossProfitMargin)} margin</p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Net Profit Card (Advanced Mode Only) */}
                {showAdvancedMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group ${
                      profitAnalysis.netProfit >= 0 
                        ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600' 
                        : 'bg-gradient-to-br from-red-500 via-red-600 to-pink-600'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                          profitAnalysis.netProfit >= 0 ? 'text-purple-100' : 'text-red-100'
                        }`}>
                          ✨ Net Profit (True Profit)
                        </p>
                        <p className="text-4xl font-bold mb-1">{formatCurrency(profitAnalysis.netProfit)}</p>
                        <p className={`text-sm font-medium ${
                          profitAnalysis.netProfit >= 0 ? 'text-purple-200' : 'text-red-200'
                        }`}>
                          {formatPercentage(profitAnalysis.netProfitMargin)} margin
                        </p>
                      </div>
                      <div className="p-4 bg-white/20 rounded-2xl">
                        <DollarSign className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Simple Mode Profit Card */}
                {!showAdvancedMode && (
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-purple-100 text-sm font-semibold mb-2 flex items-center gap-2">
                          💎 Estimated Profit
                        </p>
                        <p className="text-4xl font-bold mb-1">{formatCurrency(profitAnalysis.grossProfit)}</p>
                        <p className="text-purple-200 text-sm font-medium">{margin}% markup</p>
                      </div>
                      <div className="p-4 bg-white/20 rounded-2xl">
                        <DollarSign className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Export Controls */}
              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-700/50 p-8 relative overflow-hidden">
                {/* Section Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <div className="text-2xl">📤</div>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                    Export Data
                  </h3>
                </div>
                <div className="space-y-4 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportToPDF}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FileText size={20} />
                    Export as PDF
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportToCSV}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Download size={20} />
                    Export as CSV
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 p-8 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-zinc-700/50"
          >
            <div className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed space-y-2">
              <p className="flex items-center justify-center gap-2">
                💰 All prices in USD • 💾 Data is automatically saved to your browser
              </p>
              {showAdvancedMode ? (
                <p className="font-medium">
                  🚀 Advanced mode shows <strong className="text-purple-600 dark:text-purple-400">true net profit margin</strong> including all business expenses
                </p>
              ) : (
                <p className="font-medium">
                  💡 Switch to Advanced Mode for comprehensive profit analysis with business expenses
                </p>
              )}
              <p className="flex items-center justify-center gap-2">
                Powered by <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{APP_NAME}</span> ✨
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
          >
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-2">
                    📱 Install SellSheet Pro
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Add to your home screen for quick access and offline use!
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInstallApp}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-xl text-sm"
                    >
                      Install
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDismissInstall}
                      className="px-4 py-2 text-zinc-600 dark:text-zinc-400 text-sm"
                    >
                      Later
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Status */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
          >
            <div className="bg-orange-500/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-white" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">
                    🔌 You're offline
                  </p>
                  <p className="text-orange-100 text-xs">
                    Your data is saved locally and will sync when online
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
