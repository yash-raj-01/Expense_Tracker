/**
 * @file sampleFinancialData.js
 * @description Academic Evaluation Dataset for CS 662 (Mobile Virtual Reality & AI).
 * Provides a comprehensive, realistic financial dataset in Indian Rupees (₹)
 * spanning multiple spending categories, monthly aggregates, and individual transactions.
 * Acts as an offline fallback so the 3D VR environment renders reliably even if the backend is unreachable.
 */

export const DEFAULT_BUDGET_LIMIT = 18000; // Monthly budget ceiling per category in INR (₹)

export const SAMPLE_CATEGORIES = [
  {
    id: 'food',
    name: 'Food & Dining',
    color: '#f97316', // Orange
    amount: 14250,
    budget: 12000,
    count: 28,
    icon: '🍔',
    description: 'Groceries, dining out, cafe visits, food delivery',
  },
  {
    id: 'travel',
    name: 'Travel & Commute',
    color: '#06b6d4', // Cyan
    amount: 8600,
    budget: 10000,
    count: 14,
    icon: '✈️',
    description: 'Fuel, metro cards, ride hailing, train tickets',
  },
  {
    id: 'housing',
    name: 'Housing & Utilities',
    color: '#8b5cf6', // Violet
    amount: 24500,
    budget: 22000,
    count: 6,
    icon: '🏠',
    description: 'Rent, electricity, water, high-speed broadband',
  },
  {
    id: 'shopping',
    name: 'Shopping & Lifestyle',
    color: '#ec4899', // Pink
    amount: 19800,
    budget: 15000,
    count: 11,
    icon: '🛍️',
    description: 'Apparel, electronics, personal accessories',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & OTT',
    color: '#eab308', // Amber
    amount: 5400,
    budget: 6000,
    count: 8,
    icon: '🎬',
    description: 'Cinema, streaming subscriptions, gaming, events',
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellness',
    color: '#10b981', // Emerald
    amount: 7200,
    budget: 8000,
    count: 5,
    icon: '💊',
    description: 'Gym membership, medical checkups, pharmacy',
  },
  {
    id: 'education',
    name: 'Education & Upskilling',
    color: '#3b82f6', // Blue
    amount: 11500,
    budget: 10000,
    count: 4,
    icon: '📚',
    description: 'Certifications, online courses, technical books',
  },
  {
    id: 'investments',
    name: 'Investments & Mutual Funds',
    color: '#14b8a6', // Teal
    amount: 22000,
    budget: 20000,
    count: 3,
    icon: '📈',
    description: 'Systematic Investment Plans (SIPs), index funds',
  },
];

export const SAMPLE_TRANSACTIONS = [
  // Food & Dining
  {
    id: 'tx-101',
    category: 'Food & Dining',
    categoryId: 'food',
    title: 'Supermarket Grocery Restock',
    amount: 4250,
    date: '2026-11-12',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Monthly bulk pantry and organic supplies',
  },
  {
    id: 'tx-102',
    category: 'Food & Dining',
    categoryId: 'food',
    title: 'Weekend Bistro Family Dinner',
    amount: 3200,
    date: '2026-11-08',
    type: 'debit',
    paymentMode: 'Credit Card',
    notes: 'Dinner at Olive Garden',
  },
  {
    id: 'tx-103',
    category: 'Food & Dining',
    categoryId: 'food',
    title: 'Gourmet Coffee & Snacks',
    amount: 850,
    date: '2026-11-04',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Starbucks with colleagues',
  },
  {
    id: 'tx-104',
    category: 'Food & Dining',
    categoryId: 'food',
    title: 'Swiggy Gourmet Delivery',
    amount: 1450,
    date: '2026-11-01',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Late night study meal',
  },

  // Travel & Commute
  {
    id: 'tx-201',
    category: 'Travel & Commute',
    categoryId: 'travel',
    title: 'Vehicle Fuel Fill-up',
    amount: 3500,
    date: '2026-11-10',
    type: 'debit',
    paymentMode: 'Debit Card',
    notes: 'Full tank fuel for interstate road trip',
  },
  {
    id: 'tx-202',
    category: 'Travel & Commute',
    categoryId: 'travel',
    title: 'Monthly Metro Smartcard Recharge',
    amount: 2000,
    date: '2026-11-02',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Daily university commute',
  },
  {
    id: 'tx-203',
    category: 'Travel & Commute',
    categoryId: 'travel',
    title: 'Uber Airport Cab',
    amount: 1600,
    date: '2026-11-06',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Terminal 3 drop off',
  },

  // Housing & Utilities
  {
    id: 'tx-301',
    category: 'Housing & Utilities',
    categoryId: 'housing',
    title: 'Apartment Monthly Rent',
    amount: 18000,
    date: '2026-11-01',
    type: 'debit',
    paymentMode: 'Net Banking',
    notes: 'Direct transfer to landlord',
  },
  {
    id: 'tx-302',
    category: 'Housing & Utilities',
    categoryId: 'housing',
    title: 'Electricity Utility Bill',
    amount: 3200,
    date: '2026-11-05',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'State electricity board',
  },
  {
    id: 'tx-303',
    category: 'Housing & Utilities',
    categoryId: 'housing',
    title: 'Gigabit Fiber Internet Bill',
    amount: 1199,
    date: '2026-11-07',
    type: 'debit',
    paymentMode: 'Auto-Debit',
    notes: '300 Mbps unlimited optical line',
  },

  // Shopping & Lifestyle
  {
    id: 'tx-401',
    category: 'Shopping & Lifestyle',
    categoryId: 'shopping',
    title: 'Noise-Cancelling VR Audio Headset',
    amount: 12500,
    date: '2026-11-09',
    type: 'debit',
    paymentMode: 'Credit Card',
    notes: 'High fidelity spatial audio headphones for VR lab',
  },
  {
    id: 'tx-402',
    category: 'Shopping & Lifestyle',
    categoryId: 'shopping',
    title: 'Winter Warm Apparel',
    amount: 4800,
    date: '2026-11-03',
    type: 'debit',
    paymentMode: 'Credit Card',
    notes: 'Jackets and thermal layers',
  },

  // Entertainment & OTT
  {
    id: 'tx-501',
    category: 'Entertainment & OTT',
    categoryId: 'entertainment',
    title: 'Annual VR Gaming Platform Pass',
    amount: 3499,
    date: '2026-11-02',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'SteamVR & Quest store interactive experiences',
  },
  {
    id: 'tx-502',
    category: 'Entertainment & OTT',
    categoryId: 'entertainment',
    title: 'IMAX 3D Weekend Screening',
    amount: 1200,
    date: '2026-11-11',
    type: 'debit',
    paymentMode: 'UPI',
    notes: '2 tickets for science fiction premiere',
  },

  // Healthcare & Wellness
  {
    id: 'tx-601',
    category: 'Healthcare & Wellness',
    categoryId: 'healthcare',
    title: 'Quarterly Fitness & Gym Pass',
    amount: 4500,
    date: '2026-11-01',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Gym and calisthenics membership',
  },
  {
    id: 'tx-602',
    category: 'Healthcare & Wellness',
    categoryId: 'healthcare',
    title: 'Prescription Vitamins & Supplements',
    amount: 1750,
    date: '2026-11-07',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Multivitamins and Omega-3',
  },

  // Education & Upskilling
  {
    id: 'tx-701',
    category: 'Education & Upskilling',
    categoryId: 'education',
    title: 'Unity ML-Agents Deep Learning Certification',
    amount: 8500,
    date: '2026-11-05',
    type: 'debit',
    paymentMode: 'Credit Card',
    notes: 'Reinforcement learning in 3D physics environments',
  },
  {
    id: 'tx-702',
    category: 'Education & Upskilling',
    categoryId: 'education',
    title: 'Spatial Computing & WebXR Handbook',
    amount: 3000,
    date: '2026-11-08',
    type: 'debit',
    paymentMode: 'UPI',
    notes: 'Reference book for VR perception and optics',
  },

  // Investments & Savings
  {
    id: 'tx-801',
    category: 'Investments & Mutual Funds',
    categoryId: 'investments',
    title: 'Nifty 50 Index Fund SIP',
    amount: 15000,
    date: '2026-11-05',
    type: 'debit',
    paymentMode: 'Auto-Debit',
    notes: 'Long-term equity wealth accumulation',
  },
  {
    id: 'tx-802',
    category: 'Investments & Mutual Funds',
    categoryId: 'investments',
    title: 'Gold Sovereign Bond Deposit',
    amount: 7000,
    date: '2026-11-10',
    type: 'debit',
    paymentMode: 'Net Banking',
    notes: 'Hedge against currency inflation',
  },
];

export const MONTHLY_SPEND_HISTORY = [
  { month: 'Jun', amount: 84000 },
  { month: 'Jul', amount: 92500 },
  { month: 'Aug', amount: 89000 },
  { month: 'Sep', amount: 104000 },
  { month: 'Oct', amount: 98500 },
  { month: 'Nov', amount: 113250 },
];
