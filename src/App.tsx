import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Trash2, Plus, Sun, Moon, Calculator, DollarSign } from "lucide-react";
import { useTheme } from "next-themes";
import jsPDF from "jspdf";
import VanillaTilt from "vanilla-tilt";
import Papa from "papaparse";
import autoTable from "jspdf-autotable";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Utils and Constants
import { 
  calculateTotalCost, 
  calculateSuggestedPrice, 
  calculateComprehensiveProfitAnalysis,
  getDefaultIngredient,
  getDefaultBusinessExpenses,
  formatCurrency,
  formatPercentage,
  type Ingredient,
  type BusinessExpenses
} from "./utils/calculations";

// Types for saved recipes
interface SavedRecipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  businessExpenses: BusinessExpenses;
  margin: number;
  sellingPrice: number;
  servings: number;
  createdAt: string;
}
import { 
  UNITS, 
  DEFAULT_MARGIN, 
  MAX_MARGIN, 
  MIN_MARGIN, 
  STORAGE_KEY
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
    <Card className="relative">
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={14} />
        </Button>
      )}
      
      <CardContent className="p-4 space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor={`ingredient-name-${ingredient.id}`}>Ingredient Name</Label>
          <Input
            id={`ingredient-name-${ingredient.id}`}
            type="text"
            placeholder="Enter ingredient name"
            value={ingredient.name}
            onChange={e => onChange("name", e.target.value)}
          />
        </div>
        
        {/* Quantity and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`ingredient-quantity-${ingredient.id}`}>Quantity</Label>
            <Input
              id={`ingredient-quantity-${ingredient.id}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={ingredient.quantity || ''}
              onChange={e => onChange("quantity", Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`ingredient-unit-${ingredient.id}`}>Unit</Label>
            <select
              id={`ingredient-unit-${ingredient.id}`}
              value={ingredient.unit}
              onChange={e => onChange("unit", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Cost */}
        <div className="space-y-2">
          <Label htmlFor={`ingredient-cost-${ingredient.id}`}>Total Cost</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id={`ingredient-cost-${ingredient.id}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={ingredient.cost || ''}
              onChange={e => onChange("cost", Number(e.target.value))}
              className="pl-8"
            />
          </div>
        </div>
        
        {/* Cost Summary */}
        {ingredient.cost && ingredient.quantity && (
          <Card className="revenue-card">
            <CardContent className="p-3">
              <div className="flex justify-between text-sm">
                <span className="body-small text-blue-700 dark:text-blue-300">Cost per {ingredient.unit}:</span>
                <span className="currency-display text-blue-900 dark:text-blue-100">
                  {formatCurrency(ingredient.cost / ingredient.quantity)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([getDefaultIngredient()]);
  const [margin, setMargin] = useState(DEFAULT_MARGIN);
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(0);
  const [businessExpenses, setBusinessExpenses] = useState<BusinessExpenses>(getDefaultBusinessExpenses());
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [currentView, setCurrentView] = useState<'calculator' | 'saved'>('calculator');
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState(1);
  const { theme, setTheme } = useTheme();

  // PWA state
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.ingredients) setIngredients(data.ingredients.length > 0 ? data.ingredients : [getDefaultIngredient()]);
        if (data.margin) setMargin(data.margin);
        if (data.customSellingPrice) setCustomSellingPrice(data.customSellingPrice);
        if (data.businessExpenses) setBusinessExpenses(data.businessExpenses);
        if (data.showAdvancedMode !== undefined) setShowAdvancedMode(data.showAdvancedMode);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    // Load saved recipes
    const savedRecipesData = localStorage.getItem('sellsheet-saved-recipes');
    if (savedRecipesData) {
      try {
        const recipes = JSON.parse(savedRecipesData);
        setSavedRecipes(recipes);
      } catch (error) {
        console.error('Error loading saved recipes:', error);
      }
    }
  }, []);

  // Save data when state changes
  useEffect(() => {
    const dataToSave = {
      ingredients,
      margin,
      customSellingPrice,
      businessExpenses,
      showAdvancedMode,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [ingredients, margin, customSellingPrice, businessExpenses, showAdvancedMode]);

  // PWA Installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Apply 3D tilt effect to interactive cards
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".interactive-card");
    if (elements.length) {
      VanillaTilt.init(Array.from(elements), {
        max: 25,
        speed: 400,
        perspective: 1000,
        glare: true,
        "max-glare": 0.3
      });
    }
    // Reinitialize on view or data change
  }, [currentView, savedRecipes]);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const updateIngredient = (index: number, key: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [key]: value };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, getDefaultIngredient()]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const clearForm = () => {
    setIngredients([getDefaultIngredient()]);
    setMargin(DEFAULT_MARGIN);
    setCustomSellingPrice(0);
    setBusinessExpenses(getDefaultBusinessExpenses());
    setShowAdvancedMode(false);
    setRecipeName('');
    setServings(1);
  };

  const saveRecipe = () => {
    if (!recipeName.trim()) {
      alert('Please enter a recipe name');
      return;
    }

    const newRecipe: SavedRecipe = {
      id: Date.now().toString(),
      name: recipeName.trim(),
      ingredients: [...ingredients],
      businessExpenses: { ...businessExpenses },
      margin,
      sellingPrice: customSellingPrice || suggestedPrice,
      servings,
      createdAt: new Date().toISOString()
    };

    const updatedRecipes = [...savedRecipes, newRecipe];
    setSavedRecipes(updatedRecipes);
    localStorage.setItem('sellsheet-saved-recipes', JSON.stringify(updatedRecipes));
    
    alert('Recipe saved successfully!');
    setRecipeName('');
  };

  const deleteRecipe = (recipeId: string) => {
    console.log('Deleting recipe with ID:', recipeId);
    if (confirm('Are you sure you want to delete this recipe?')) {
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
      setSavedRecipes(updatedRecipes);
      localStorage.setItem('sellsheet-saved-recipes', JSON.stringify(updatedRecipes));
      console.log('Recipe deleted successfully');
    }
  };

  const loadRecipe = (recipe: SavedRecipe) => {
    console.log('Loading recipe:', recipe.name);
    setIngredients(recipe.ingredients);
    setBusinessExpenses(recipe.businessExpenses);
    setMargin(recipe.margin);
    setCustomSellingPrice(recipe.sellingPrice);
    setServings(recipe.servings);
    setRecipeName(recipe.name);
    setCurrentView('calculator');
    console.log('Recipe loaded, switching to calculator view');
  };

  // Calculations
  const totalCost = calculateTotalCost(ingredients, businessExpenses, showAdvancedMode);
  const suggestedPrice = calculateSuggestedPrice(totalCost, margin);
  const sellingPrice = customSellingPrice > 0 ? customSellingPrice : suggestedPrice;
  const profitAnalysis = calculateComprehensiveProfitAnalysis(
    ingredients,
    sellingPrice,
    businessExpenses,
    showAdvancedMode
  );

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('SellSheet Pro - Profit Analysis', 20, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Total Ingredients: ${ingredients.filter(i => i.name).length}`, 20, 55);
    doc.text(`Selling Price: ${formatCurrency(sellingPrice)}`, 20, 65);
    doc.text(`Total Cost: ${formatCurrency(totalCost)}`, 20, 75);
    doc.text(`Profit: ${formatCurrency(profitAnalysis.totalProfit)}`, 20, 85);
    doc.text(`Profit Margin: ${formatPercentage(profitAnalysis.profitMargin)}`, 20, 95);

    // Ingredients table
    const tableData = ingredients
      .filter(ingredient => ingredient.name)
      .map(ingredient => [
        ingredient.name,
        ingredient.quantity?.toString() || '0',
        ingredient.unit,
        formatCurrency(ingredient.cost || 0)
      ]);

    autoTable(doc, {
      head: [['Ingredient', 'Quantity', 'Unit', 'Cost']],
      body: tableData,
      startY: 110,
    });

    doc.save('sellsheet-analysis.pdf');
  };

  const exportToCSV = () => {
    const csvData = [
      ['Ingredient Name', 'Quantity', 'Unit', 'Cost'],
      ...ingredients
        .filter(ingredient => ingredient.name)
        .map(ingredient => [
          ingredient.name,
          ingredient.quantity?.toString() || '0',
          ingredient.unit,
          (ingredient.cost || 0).toString()
        ]),
      ['', '', '', ''],
      ['Summary', '', '', ''],
      ['Selling Price', '', '', sellingPrice.toString()],
      ['Total Cost', '', '', totalCost.toString()],
      ['Profit', '', '', profitAnalysis.totalProfit.toString()],
      ['Profit Margin', '', '', (profitAnalysis.profitMargin / 100).toString()]
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sellsheet-data.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Calculator className="mr-2 h-6 w-6 text-primary animate-pulse-glow" />
            <span className="heading-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              SellSheet Pro
            </span>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <p className="body-small text-muted-foreground hidden md:block">
                Professional profit calculator for your business
              </p>
            </div>
            <nav className="flex items-center space-x-2">
              {showInstallPrompt && (
                <Button variant="outline" size="sm" onClick={handleInstallPWA} className="animate-fade-in-up btn-gradient-success">
                  Install App
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-all duration-300 hover:scale-110 rounded-full"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="tab-navigation">
            <Button
              variant={currentView === 'calculator' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('calculator')}
              className={`tab-button ${currentView === 'calculator' ? 'active' : ''} flex items-center gap-2`}
            >
              <Calculator className="h-4 w-4" />
              Calculator
            </Button>
            <Button
              variant={currentView === 'saved' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('saved')}
              className={`tab-button ${currentView === 'saved' ? 'active' : ''} flex items-center gap-2`}
            >
              <FileText className="h-4 w-4" />
              Saved Recipes
            </Button>
          </div>
        </div>

        {currentView === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recipe Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="heading-3">Recipe Details</CardTitle>
                  <CardDescription className="body-small">
                    Add your ingredients and costs to calculate profitability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipe-name">Recipe Name</Label>
                      <Input 
                        id="recipe-name" 
                        placeholder="Enter recipe name"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servings">Servings</Label>
                      <Input 
                        id="servings" 
                        type="number" 
                        value={servings}
                        onChange={(e) => setServings(Number(e.target.value))}
                        min="1" 
                      />
                    </div>
                  </div>
                </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="heading-3">Ingredients</CardTitle>
                <CardDescription className="body-small">
                  List all ingredients with their quantities and costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {ingredients.map((ingredient, index) => (
                    <motion.div
                      key={ingredient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <IngredientInput
                        ingredient={ingredient}
                        onChange={(key, value) => updateIngredient(index, key, value)}
                        onRemove={() => removeIngredient(index)}
                        canRemove={ingredients.length > 1}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <Button onClick={addIngredient} variant="outline" className="w-full animate-scale-in">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </CardContent>
            </Card>

            {/* Costs & Pricing */}
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="heading-3">Costs & Pricing</CardTitle>
                <CardDescription className="body-small">
                  Set your selling price and additional costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="selling-price">Selling Price ($)</Label>
                    <Input
                      id="selling-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={customSellingPrice || ''}
                      onChange={e => setCustomSellingPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin">Target Margin (%)</Label>
                    <Input
                      id="margin"
                      type="number"
                      min={MIN_MARGIN}
                      max={MAX_MARGIN}
                      value={margin}
                      onChange={e => setMargin(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-mode"
                    checked={showAdvancedMode}
                    onCheckedChange={setShowAdvancedMode}
                  />
                  <Label htmlFor="advanced-mode">Advanced Cost Analysis</Label>
                </div>

                {showAdvancedMode && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="labor-cost">Labor Cost ($)</Label>
                      <Input
                        id="labor-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={businessExpenses.laborCost || ''}
                        onChange={e => setBusinessExpenses({
                          ...businessExpenses,
                          laborCost: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overhead-cost">Overhead Cost ($)</Label>
                      <Input
                        id="overhead-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={businessExpenses.overheadCost || ''}
                        onChange={e => setBusinessExpenses({
                          ...businessExpenses,
                          overheadCost: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packaging-cost">Packaging Cost ($)</Label>
                      <Input
                        id="packaging-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={businessExpenses.packagingCost || ''}
                        onChange={e => setBusinessExpenses({
                          ...businessExpenses,
                          packagingCost: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={clearForm} variant="outline" className="flex-1 hover:scale-105 transition-transform">
                    Clear Form
                  </Button>
                  <Button onClick={saveRecipe} className="flex-1 btn-gradient-success">
                    Save Recipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profit Analysis */}
          <div className="space-y-6">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="heading-3">Profit Analysis</CardTitle>
                <CardDescription className="body-small">
                  Real-time calculation of your costs and profits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="profit-analysis-center">
                  <motion.div 
                    className="revenue-card profit-metric-row"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="profit-metric-label text-blue-700 dark:text-blue-300">Ingredients</span>
                    <span className="profit-metric-value text-blue-900 dark:text-blue-100">
                      {formatCurrency(profitAnalysis.ingredientsCost)}
                    </span>
                  </motion.div>

                  <motion.div 
                    className="cost-card profit-metric-row"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="profit-metric-label text-orange-700 dark:text-orange-300">Total Cost</span>
                    <span className="profit-metric-value text-orange-900 dark:text-orange-100">
                      {formatCurrency(totalCost)}
                    </span>
                  </motion.div>

                  <motion.div 
                    className="profit-card profit-metric-row"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="profit-metric-label text-green-700 dark:text-green-300">Profit</span>
                    <span className="profit-metric-value text-green-900 dark:text-green-100">
                      {formatCurrency(profitAnalysis.totalProfit)}
                    </span>
                  </motion.div>

                  <motion.div 
                    className="margin-card profit-metric-row"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="profit-metric-label text-purple-700 dark:text-purple-300">Margin</span>
                    <span className="profit-metric-value text-purple-900 dark:text-purple-100">
                      {formatPercentage(profitAnalysis.profitMargin)}
                    </span>
                  </motion.div>

                  <motion.div 
                    className="neutral-card profit-metric-row"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="profit-metric-label">Per Serving</span>
                    <span className="profit-metric-value">
                      {formatCurrency(sellingPrice)}
                    </span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button onClick={exportToPDF} variant="outline" size="sm" className="animate-scale-in hover:scale-105 transition-transform">
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button onClick={exportToCSV} variant="outline" size="sm" className="animate-scale-in hover:scale-105 transition-transform">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Price */}
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="heading-4 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-primary" />
                  Suggested Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <div className="currency-large text-primary mb-2">
                    {formatCurrency(suggestedPrice)}
                  </div>
                  <p className="caption">
                    Based on {margin}% margin
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        ) : (
          /* Saved Recipes View */
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="teal-gradient-header text-white p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
                  <FileText className="h-8 w-8" />
                  Saved Recipes ({savedRecipes.length})
                </h2>
                <p className="text-lg opacity-90">Manage your collection of profitable recipes</p>
              </div>
            </div>

            {savedRecipes.length === 0 ? (
              <Card className="modern-card text-center p-12">
                <CardContent>
                  <div className="animate-float mb-6">
                    <FileText className="h-20 w-20 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">No saved recipes yet</h3>
                  <p className="text-muted-foreground mb-8 text-lg">
                    Create your first recipe using the calculator
                  </p>
                  <Button onClick={() => setCurrentView('calculator')} className="btn-gradient-primary text-lg px-8 py-3">
                    <Plus className="mr-2 h-5 w-5" />
                    Start Calculating
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="recipe-grid-center">
                {savedRecipes.map((recipe) => {
                  const recipeProfit = calculateComprehensiveProfitAnalysis(
                    recipe.ingredients,
                    recipe.sellingPrice,
                    recipe.businessExpenses,
                    true
                  );
                  return (
                    <Card key={recipe.id} className="interactive-card modern-card overflow-hidden">
                      <div className="recipe-card-header text-white p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold">{recipe.name}</h3>
                          <div className="text-sm opacity-90 bg-white/20 px-4 py-2 rounded-full">
                            {recipe.servings} servings
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="cost-card text-center p-4 rounded-xl">
                            <div className="text-sm opacity-90 mb-1">Cost</div>
                            <div className="text-xl font-bold">
                              {formatCurrency(recipeProfit.totalExpenses)}
                            </div>
                          </div>
                          <div className="revenue-card text-center p-4 rounded-xl">
                            <div className="text-sm opacity-90 mb-1">Price</div>
                            <div className="text-xl font-bold">
                              {formatCurrency(recipe.sellingPrice)}
                            </div>
                          </div>
                          <div className="profit-card text-center p-4 rounded-xl">
                            <div className="text-sm opacity-90 mb-1">Profit</div>
                            <div className="text-xl font-bold">
                              {formatCurrency(recipeProfit.totalProfit)}
                            </div>
                          </div>
                          <div className="margin-card text-center p-4 rounded-xl">
                            <div className="text-sm opacity-90 mb-1">Margin</div>
                            <div className="text-xl font-bold">
                              {formatPercentage(recipeProfit.profitMargin)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            onClick={() => loadRecipe(recipe)}
                            className="flex-1 btn-gradient-success px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:transform hover:translateY(-2px)"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteRecipe(recipe.id)}
                            className="flex-1 btn-gradient-danger px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:transform hover:translateY(-2px) flex items-center justify-center"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
