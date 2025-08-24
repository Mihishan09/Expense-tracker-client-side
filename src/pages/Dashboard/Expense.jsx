import { memo, useEffect, useState } from 'react';
import api from '../../utils/axios';
import { API_PATHS } from '../../utils/apiPaths';

const Expense = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Other');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(API_PATHS.expense.list);
      setItems(data);
    } catch (e) { setError('Failed to load expenses'); }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_PATHS.expense.add, { description, amount: Number(amount), date, category, paymentMethod });
      setDescription(''); setAmount(''); setDate(''); setCategory('Other'); setPaymentMethod('Cash');
      load();
    } catch (e) { setError(e?.response?.data?.error || 'Failed to add'); }
  };

  const onDelete = async (id) => {
    try { await api.delete(API_PATHS.expense.remove(id)); load(); } catch {}
  };

  const onExport = async () => {
    const res = await api.get(API_PATHS.expense.export, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', 'expenses.xlsx');
    document.body.appendChild(link); link.click(); link.remove();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Expenses</h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input className="input-box" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <input className="input-box" placeholder="Amount" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <input className="input-box" placeholder="Date" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <select className="input-box" value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>
        <select className="input-box" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
          <option value="Cash">Cash</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Digital Wallet">Digital Wallet</option>
          <option value="Other">Other</option>
        </select>
        <button className="btn-primary md:col-span-2" type="submit">Add Expense</button>
      </form>

      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium">List</h4>
        <button onClick={onExport} className="px-3 py-2 text-xs rounded bg-slate-200">Export Excel</button>
      </div>

      <div className="bg-white rounded-xl shadow border divide-y">
        {items.map((it) => (
          <div key={it._id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{it.description}</div>
              <div className="text-xs text-gray-500">{new Date(it.date).toLocaleDateString()} · {it.category} · {it.paymentMethod}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-rose-600 font-semibold">-${it.amount.toFixed(2)}</span>
              <button onClick={()=>onDelete(it._id)} className="text-rose-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-4 text-sm text-gray-500">No expenses yet.</div>}
      </div>
    </div>
  );
};

export default memo(Expense);