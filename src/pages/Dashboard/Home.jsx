import { memo, useEffect, useMemo, useState } from 'react';
import api from '../../utils/axios';
import { API_PATHS } from '../../utils/apiPaths';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const Home = () => {
  const [data, setData] = useState({ totalIncome: 0, totalExpense: 0, recentIncome: [], recentExpenses: [] });
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log('Fetching dashboard data...');
        const [dash, inc, exp] = await Promise.all([
          api.get(API_PATHS.dashboard),
          api.get(API_PATHS.income.list),
          api.get(API_PATHS.expense.list)
        ]);
        console.log('Dashboard data received:', dash.data);
        setData(dash.data);
        setIncome(inc.data || []);
        setExpenses(exp.data || []);
        setError('');
      } catch (e) {
        console.error('Dashboard fetch error:', e);
        setError('Failed to load dashboard - Backend may not be running');
        // Set default data to show the UI structure
        setData({ totalIncome: 0, totalExpense: 0, recentIncome: [], recentExpenses: [] });
        setIncome([]);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const balance = data.totalIncome - data.totalExpense;

  const financialOverview = useMemo(() => ([
    { name: 'Income', value: data.totalIncome },
    { name: 'Expense', value: data.totalExpense }
  ]), [data.totalIncome, data.totalExpense]);

  const last30DaysExpenses = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 29);
    const byDay = new Map();
    // initialize last 30 days with zero
    for (let i = 0; i < 30; i++) {
      const d = new Date(cutoff);
      d.setDate(cutoff.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, 0);
    }
    (expenses || []).forEach((e) => {
      const dt = new Date(e.date);
      if (dt >= cutoff) {
        const key = dt.toISOString().slice(0, 10);
        byDay.set(key, (byDay.get(key) || 0) + Number(e.amount || 0));
      }
    });
    return Array.from(byDay.entries()).map(([date, amount]) => ({ date: date.slice(5), amount }));
  }, [expenses]);

  const last60DaysIncomeByCategory = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 59);
    const sums = new Map();
    (income || []).forEach((i) => {
      const dt = new Date(i.date);
      if (dt >= cutoff) {
        const cat = i.category || 'Other';
        sums.set(cat, (sums.get(cat) || 0) + Number(i.amount || 0));
      }
    });
    return Array.from(sums.entries()).map(([name, value]) => ({ name, value }));
  }, [income]);

  const COLORS = ['#8B5CF6', '#A855F7', '#C084FC', '#D8B4FE', '#E9D5FF', '#F3E8FF'];
  const PURPLE_GRADIENTS = {
    primary: 'from-purple-600 to-purple-700',
    secondary: 'from-violet-500 to-purple-600',
    accent: 'from-fuchsia-500 to-purple-500'
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-800">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-purple-800">Dashboard</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Connection Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Make sure your backend server is running on port 5000</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg border-0 text-white">
          <h4 className="text-sm text-emerald-100 mb-2">Total Income</h4>
          <div className="text-3xl font-bold">${data.totalIncome.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 rounded-2xl shadow-lg border-0 text-white">
          <h4 className="text-sm text-rose-100 mb-2">Total Expense</h4>
          <div className="text-3xl font-bold">${data.totalExpense.toFixed(2)}</div>
        </div>
        <div className={`bg-gradient-to-r ${balance >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-rose-500 to-rose-600'} p-6 rounded-2xl shadow-lg border-0 text-white`}>
          <h4 className="text-sm mb-2 opacity-90">Balance</h4>
          <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Recent Expenses</h4>
          <ul className="text-sm">
            {data.recentExpenses.length > 0 ? (
              data.recentExpenses.map((e) => (
                <li key={e._id} className="flex justify-between py-2 border-b border-purple-100 last:border-b-0 hover:bg-purple-50 rounded px-2">
                  <span>{e.description}</span>
                  <span className="text-rose-600 font-semibold">-${e.amount.toFixed(2)}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 py-2">No expenses yet</li>
            )}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Recent Income</h4>
          <ul className="text-sm">
            {data.recentIncome.length > 0 ? (
              data.recentIncome.map((i) => (
                <li key={i._id} className="flex justify-between py-2 border-b border-purple-100 last:border-b-0 hover:bg-purple-50 rounded px-2">
                  <span>{i.description}</span>
                  <span className="text-emerald-600 font-semibold">+${i.amount.toFixed(2)}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 py-2">No income yet</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 h-80">
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Financial Overview</h4>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={financialOverview} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {financialOverview.map((entry, index) => (
                  <Cell key={`fo-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 h-80 lg:col-span-2">
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Last 30 Days Expenses</h4>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={last30DaysExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="amount" name="Expenses" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 h-80">
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Last 60 Days Income (By Category)</h4>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={last60DaysIncomeByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {last60DaysIncomeByCategory.map((entry, index) => (
                  <Cell key={`inc-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default memo(Home);