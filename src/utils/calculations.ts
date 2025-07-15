export interface Ingredient {
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
}

export interface ProfitAnalysis {
  totalRevenue: number;
  cogs: number;               // Cost of Goods Sold (ingredients)
  grossProfit: number;
  grossProfitMargin: number;
  totalExpenses: number;
  netProfit: number;
  netProfitMargin: number;
}

export const calculateTotalCost = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((sum, ing) => sum + (Number(ing.cost) || 0), 0);
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
  businessExpenses: BusinessExpenses
): ProfitAnalysis => {
  const cogs = calculateTotalCost(ingredients);
  const totalRevenue = suggestedPrice;
  const grossProfit = calculateGrossProfit(totalRevenue, cogs);
  const grossProfitMargin = calculateGrossProfitMargin(grossProfit, totalRevenue);
  const totalExpenses = calculateTotalExpenses(cogs, businessExpenses);
  const netProfit = calculateNetProfit(totalRevenue, totalExpenses);
  const netProfitMargin = calculateNetProfitMargin(netProfit, totalRevenue);

  return {
    totalRevenue,
    cogs,
    grossProfit,
    grossProfitMargin,
    totalExpenses,
    netProfit,
    netProfitMargin
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
  name: "",
  quantity: 1,
  unit: "g",
  cost: 0
});

export const getDefaultBusinessExpenses = (): BusinessExpenses => ({
  operatingExpenses: 0,
  interestExpenses: 0,
  taxes: 0,
  otherExpenses: 0
});
