// Utility functions for data manipulation

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getCategoryColor = (category) => {
  const colors = {
    'Food': 'bg-orange-100 text-orange-800',
    'Transport': 'bg-blue-100 text-blue-800',
    'Entertainment': 'bg-purple-100 text-purple-800',
    'Shopping': 'bg-pink-100 text-pink-800',
    'Bills': 'bg-red-100 text-red-800',
    'Healthcare': 'bg-green-100 text-green-800',
    'Education': 'bg-indigo-100 text-indigo-800',
    'Other': 'bg-gray-100 text-gray-800',
    'Salary': 'bg-emerald-100 text-emerald-800',
    'Freelance': 'bg-amber-100 text-amber-800',
    'Business': 'bg-cyan-100 text-cyan-800',
    'Investment': 'bg-violet-100 text-violet-800',
    'Gift': 'bg-rose-100 text-rose-800'
  };
  return colors[category] || colors['Other'];
};
