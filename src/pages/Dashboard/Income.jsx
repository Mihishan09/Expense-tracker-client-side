import { memo, useEffect, useState } from 'react';
import api from '../../utils/axios';
import { API_PATHS } from '../../utils/apiPaths';

const Income = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Salary');
  const [source, setSource] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(API_PATHS.income.list);
      setItems(data);
    } catch (e) { setError('Failed to load income'); }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_PATHS.income.add, { description, amount: Number(amount), date, category, source });
      setDescription(''); setAmount(''); setDate(''); setCategory('Salary'); setSource('');
      load();
    } catch (e) { setError(e?.response?.data?.error || 'Failed to add'); }
  };

  const onDelete = async (id) => {
    try { await api.delete(API_PATHS.income.remove(id)); load(); } catch {}
  };

  const onExport = async () => {
    const res = await api.get(API_PATHS.income.export, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', 'income.xlsx');
    document.body.appendChild(link); link.click(); link.remove();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Income</h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input className="input-box" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <input className="input-box" placeholder="Amount" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <input className="input-box" placeholder="Date" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <select className="input-box" value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="Salary">Salary</option>
          <option value="Freelance">Freelance</option>
          <option value="Business">Business</option>
          <option value="Investment">Investment</option>
          <option value="Gift">Gift</option>
          <option value="Other">Other</option>
        </select>
        <input className="input-box" placeholder="Source" value={source} onChange={(e)=>setSource(e.target.value)} />
        <button className="btn-primary md:col-span-2" type="submit">Add Income</button>
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
              <div className="text-xs text-gray-500">{new Date(it.date).toLocaleDateString()} · {it.category} · {it.source}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-600 font-semibold">+${it.amount.toFixed(2)}</span>
              <button onClick={()=>onDelete(it._id)} className="text-rose-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-4 text-sm text-gray-500">No income yet.</div>}
      </div>
    </div>
  );
};

export default memo(Income);