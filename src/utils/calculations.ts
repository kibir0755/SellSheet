export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface BusinessExpenses {
  operatingExpenses: number;  // Rent, salaries, marketing, utilities, etc.
  interestExpenses: number;   // Loan interest, credit card interest, etc.
  taxes: number;              // Business taxes
  otherExpenses: number;      // Miscellaneous business expenses
  laborCost: number;          // Labor costs
  overheadCost: number;       // Overhead costs
  packagingCost: number;      // Packaging costs
}

export interface ProfitAnalysis {
  totalRevenue: number;
  cogs: number;               // Cost of Goods Sold (ingredients)
  grossProfit: number;
  grossProfitMargin: number;
  totalExpenses: number;
  netProfit: number;
  netProfitMargin: number;
  ingredientsCost: number;    // Total ingredients cost
  totalProfit: number;        // Same as netProfit
  profitMargin: number;       // Same as netProfitMargin
}

export const calculateTotalCost = (ingredients: Ingredient[], businessExpenses?: BusinessExpenses, includeBusinessExpenses?: boolean): number => {
  const ingredientsCost = ingredients.reduce((sum, ing) => sum + (Number(ing.cost) || 0), 0);
  
  if (includeBusinessExpenses && businessExpenses) {
    return ingredientsCost + 
           businessExpenses.laborCost + 
           businessExpenses.overheadCost + 
           businessExpenses.packagingCost +
           businessExpenses.operatingExpenses + 
           businessExpenses.interestExpenses + 
           businessExpenses.taxes + 
           businessExpenses.otherExpenses;
  }
  
  return ingredientsCost;
};

export const calculateSuggestedPrice = (totalCost: number, marginPercent: number): number => {
  return totalCost * (1 + marginPercent / 100);
};

export const calculateGrossProfit = (revenue: number, cogs: number): number => {
  return revenue - cogs;
};

export const calculateGrossProfitMargin = (grossProfit: number, revenue: number): number => {
  return revenue > 0 ? (grossProfit / revenue) * 100 : 0;
};

export const calculateTotalExpenses = (cogs: number, businessExpenses: BusinessExpenses): number => {
  return cogs + 
         businessExpenses.operatingExpenses + 
         businessExpenses.interestExpenses + 
         businessExpenses.taxes + 
         businessExpenses.otherExpenses;
};

export const calculateNetProfit = (revenue: number, totalExpenses: number): number => {
  return revenue - totalExpenses;
};

export const calculateNetProfitMargin = (netProfit: number, revenue: number): number => {
  return revenue > 0 ? (netProfit / revenue) * 100 : 0;
};

export const calculateComprehensiveProfitAnalysis = (
  ingredients: Ingredient[], 
  suggestedPrice: number,
  businessExpenses: BusinessExpenses,
  includeBusinessExpenses?: boolean
): ProfitAnalysis => {
  const cogs = calculateTotalCost(ingredients);
  const totalRevenue = suggestedPrice;
  const grossProfit = calculateGrossProfit(totalRevenue, cogs);
  const grossProfitMargin = calculateGrossProfitMargin(grossProfit, totalRevenue);
  const totalExpenses = includeBusinessExpenses ? 
    calculateTotalExpenses(cogs, businessExpenses) : cogs;
  const netProfit = calculateNetProfit(totalRevenue, totalExpenses);
  const netProfitMargin = calculateNetProfitMargin(netProfit, totalRevenue);

  return {
    totalRevenue,
    cogs,
    grossProfit,
    grossProfitMargin,
    totalExpenses,
    netProfit,
    netProfitMargin,
    ingredientsCost: cogs,
    totalProfit: netProfit,
    profitMargin: netProfitMargin
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const validateIngredient = (ingredient: Ingredient): boolean => {
  return ingredient.name.trim() !== '' && 
         ingredient.quantity > 0 && 
         ingredient.cost >= 0;
};

export const getDefaultIngredient = (): Ingredient => ({
  id: Math.random().toString(36).substr(2, 9),
  name: "",
  quantity: 1,
  unit: "g",
  cost: 0
});

export const getDefaultBusinessExpenses = (): BusinessExpenses => ({
  operatingExpenses: 0,
  interestExpenses: 0,
  taxes: 0,
  otherExpenses: 0,
  laborCost: 0,
  overheadCost: 0,
  packagingCost: 0
});
