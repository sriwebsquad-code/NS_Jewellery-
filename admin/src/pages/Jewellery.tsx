import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';

const JewelleryManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Form states
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState<File | null>(null);

  const [itemName, setItemName] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemPurity, setItemPurity] = useState('22K');
  const [itemImage, setItemImage] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('http://localhost:5000/api/jewellery/categories'),
        fetch('http://localhost:5000/api/jewellery/items')
      ]);
      const catData = await catRes.json();
      const itemData = await itemRes.json();
      if (catData.success) setCategories(catData.data);
      if (itemData.success) setItems(itemData.data);
    } catch (error) {
      console.error('Error fetching jewellery data:', error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', catName);
    if (catImage) formData.append('image', catImage);

    try {
      const res = await fetch('http://localhost:5000/api/jewellery/categories', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setIsAddingCategory(false);
        setCatName('');
        setCatImage(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to save: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to connect to the server. Please ensure the backend is running.');
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('categoryId', itemCategoryId);
    formData.append('weight', itemWeight);
    formData.append('purity', itemPurity);
    if (itemImage) formData.append('image', itemImage);

    try {
      const res = await fetch('http://localhost:5000/api/jewellery/items', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setIsAddingItem(false);
        setItemName('');
        setItemWeight('');
        setItemImage(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to save: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to connect to the server. Please ensure the backend is running.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center glass-panel p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Jewellery Catalogue</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage categories and items.</p>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setIsAddingCategory(true)} className="bg-gradient-to-r from-secondary to-secondary-light text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-secondary/30 transition-all transform hover:-translate-y-0.5 font-semibold">
            <Plus size={20} />
            <span>Add Category</span>
          </button>
          <button onClick={() => setIsAddingItem(true)} className="bg-gradient-to-r from-primary to-primary-light text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 font-semibold text-gray-900">
            <Plus size={20} color="#111827" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {isAddingCategory && (
        <form onSubmit={handleCreateCategory} className="glass-card p-6 rounded-3xl shadow-lg border border-white/40 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-secondary-light to-primary" />
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">New Category</h3>
            <button type="button" onClick={() => setIsAddingCategory(false)} className="bg-gray-100/50 hover:bg-gray-200/50 p-2 rounded-full transition-colors"><X size={20} className="text-gray-600" /></button>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <input required type="text" placeholder="Category Name (e.g. Long Haram)" value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-5 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-xl focus:ring-4 focus:ring-secondary/20 focus:border-secondary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700" />
            <input type="file" accept="image/*" onChange={e => setCatImage(e.target.files?.[0] || null)} className="w-full px-5 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-xl focus:ring-4 focus:ring-secondary/20 focus:border-secondary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700" />
          </div>
          <button type="submit" className="bg-secondary text-white px-8 py-3 rounded-xl hover:bg-secondary-light transition-colors font-semibold shadow-md">Save Category</button>
        </form>
      )}

      {isAddingItem && (
        <form onSubmit={handleCreateItem} className="glass-card p-6 rounded-3xl shadow-lg border border-white/40 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-light to-secondary" />
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">New Jewellery Item</h3>
            <button type="button" onClick={() => setIsAddingItem(false)} className="bg-gray-100/50 hover:bg-gray-200/50 p-2 rounded-full transition-colors"><X size={20} className="text-gray-600" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input required type="text" placeholder="Item Name (e.g. Haram Indo Kuwait)" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-5 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700" />
            <select required value={itemCategoryId} onChange={e => setItemCategoryId(e.target.value)} className="w-full px-5 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Weight (g)" value={itemWeight} onChange={e => setItemWeight(e.target.value)} className="w-full px-5 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700" />
            <select value={itemPurity} onChange={e => setItemPurity(e.target.value)} className="w-full px-5 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700">
              <option value="22K">22K</option>
              <option value="24K">24K</option>
              <option value="18K">18K</option>
            </select>
            <input type="file" accept="image/*" onChange={e => setItemImage(e.target.files?.[0] || null)} className="w-full px-5 py-3 bg-white/70 backdrop-blur-sm border-2 border-white rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all shadow-sm font-medium text-gray-700 md:col-span-2" />
          </div>
          <button type="submit" className="bg-primary text-gray-900 px-8 py-3 rounded-xl hover:bg-primary-light transition-colors font-bold shadow-md">Save Item</button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl shadow-lg border border-white/40">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100/50 pb-4">Categories</h3>
          <div className="space-y-3">
            {categories.map((cat, index) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-white hover:bg-white/80 transition-colors shadow-sm group" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                    {cat.image ? <img src={`http://localhost:5000${cat.image}`} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <ImageIcon className="text-gray-400" />}
                  </div>
                  <span className="font-bold text-gray-700">{cat.name}</span>
                </div>
                <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-gray-500 text-center py-8 font-medium">No categories found.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6 rounded-3xl shadow-lg border border-white/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-primary via-primary-light to-transparent" />
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100/50 pb-4">Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex space-x-4 p-4 bg-white/50 rounded-2xl border border-white hover:bg-white/80 transition-all hover:shadow-md group">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? <img src={`http://localhost:5000${item.images[0]}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <ImageIcon className="text-gray-400 m-auto mt-6" />}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 leading-tight">{item.name}</h4>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-primary mt-1 uppercase tracking-wider">{item.category?.name || 'Uncategorized'}</p>
                  <p className="text-sm text-gray-600 mt-2 font-medium">{item.weight}g • {item.purity}</p>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-gray-500 text-center py-8 col-span-2 font-medium">No items found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JewelleryManagement;
