import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const JewelleryManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Form states
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState<File | null>(null);

  const [itemName, setItemName] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemPurity, setItemPurity] = useState('22K');
  const [itemStock, setItemStock] = useState('10');
  const [itemBasePrice, setItemBasePrice] = useState('');
  const [itemImage, setItemImage] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch('https://ns-jewellery.onrender.com/api/jewellery/categories'),
        fetch('https://ns-jewellery.onrender.com/api/jewellery/items')
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
      const res = await fetch('https://ns-jewellery.onrender.com/api/jewellery/categories', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setIsAddingCategory(false);
        setCatName('');
        setCatImage(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to save: ${data.message || 'Unknown error'}\nDetails: ${data.error || 'No details'}`);
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
    formData.append('stock', itemStock);
    if (itemBasePrice) formData.append('basePrice', itemBasePrice);
    if (itemImage) formData.append('image', itemImage);

    try {
      const res = await fetch('https://ns-jewellery.onrender.com/api/jewellery/items', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setIsAddingItem(false);
        setItemName('');
        setItemWeight('');
        setItemBasePrice('');
        setItemStock('10');
        setItemImage(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to save item: ${data.message || 'Unknown error'}\nDetails: ${data.error || 'No details'}`);
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to connect to the server. Please ensure the backend is running.');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`https://ns-jewellery.onrender.com/api/jewellery/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to delete category: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Error connecting to the server.');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the item "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`https://ns-jewellery.onrender.com/api/jewellery/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Failed to delete item: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Error connecting to the server.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-primary/10">
        <div>
          <h2 className="text-3xl font-serif text-secondary">Jewellery Catalogue</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage categories and items.</p>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setIsAddingCategory(true)} className="bg-background text-primary border border-primary px-5 py-2.5 rounded flex items-center space-x-2 hover:bg-primary/5 transition-all font-semibold uppercase tracking-wider text-xs">
            <Plus size={16} />
            <span>Add Category</span>
          </button>
          <button onClick={() => setIsAddingItem(true)} className="bg-primary text-white px-5 py-2.5 rounded flex items-center space-x-2 hover:bg-primary-dark transition-all font-semibold uppercase tracking-wider text-xs shadow-sm">
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {isAddingCategory && (
        <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-xl shadow-sm border border-primary/10 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex justify-between items-center mb-6 pl-4">
            <h3 className="text-xl font-serif text-secondary">New Category</h3>
            <button type="button" onClick={() => setIsAddingCategory(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6 pl-4">
            <input required type="text" placeholder="Category Name (e.g. Long Haram)" value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary" />
            <input type="file" accept="image/*" onChange={e => setCatImage(e.target.files?.[0] || null)} className="w-full px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary" />
          </div>
          <div className="pl-4">
            <button type="submit" className="bg-primary text-white px-8 py-3 rounded hover:bg-primary-dark transition-colors font-semibold shadow-sm text-sm uppercase tracking-wider">Save Category</button>
          </div>
        </form>
      )}

      {isAddingItem && (
        <form onSubmit={handleCreateItem} className="bg-white p-6 rounded-xl shadow-sm border border-primary/10 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex justify-between items-center mb-6 pl-4">
            <h3 className="text-xl font-serif text-secondary">New Jewellery Item</h3>
            <button type="button" onClick={() => setIsAddingItem(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pl-4">
            <input required type="text" placeholder="Item Name (e.g. Haram Indo Kuwait)" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary" />
            
            <select required value={itemCategoryId} onChange={e => setItemCategoryId(e.target.value)} className="w-full px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            <div className="flex space-x-4">
              <input required type="number" step="0.01" placeholder="Weight (g)" value={itemWeight} onChange={e => setItemWeight(e.target.value)} className="w-1/2 px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary" />
              <select value={itemPurity} onChange={e => setItemPurity(e.target.value)} className="w-1/2 px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary">
                <option value="22K">22K</option>
                <option value="24K">24K</option>
                <option value="18K">18K</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <input required type="number" placeholder="Stock Qty" value={itemStock} onChange={e => setItemStock(e.target.value)} className="w-1/2 px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary" />
              <input type="number" placeholder="Base Price (₹) - Optional" value={itemBasePrice} onChange={e => setItemBasePrice(e.target.value)} className="w-1/2 px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary" />
            </div>

            <input type="file" accept="image/*" onChange={e => setItemImage(e.target.files?.[0] || null)} className="w-full px-4 py-3 bg-background border border-primary/20 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-secondary md:col-span-2" />
          </div>
          <div className="pl-4">
            <button type="submit" className="bg-primary text-white px-8 py-3 rounded hover:bg-primary-dark transition-colors font-bold shadow-sm text-sm uppercase tracking-wider">Save Item</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-primary/10">
          <h3 className="text-xl font-serif text-secondary mb-6 border-b border-primary/10 pb-4">Categories</h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-background rounded border border-primary/10 hover:border-primary/30 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded overflow-hidden flex items-center justify-center border border-primary/10">
                    {cat.image ? (
                      <img 
                        src={cat.image.startsWith('http') ? cat.image : `https://ns-jewellery.onrender.com${cat.image}`} 
                        alt={cat.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : <ImageIcon className="text-primary/40" />}
                  </div>
                  <span className="font-semibold text-secondary">{cat.name}</span>
                </div>
                <button 
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-gray-400 text-center py-8 font-medium">No categories found.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-primary/10">
          <h3 className="text-xl font-serif text-secondary mb-6 border-b border-primary/10 pb-4">Inventory Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex space-x-4 p-4 bg-background rounded border border-primary/10 hover:border-primary/30 transition-all group">
                <div className="w-20 h-20 bg-white rounded overflow-hidden flex-shrink-0 border border-primary/10">
                  {item.images?.[0] ? (
                    <img 
                      src={item.images[0].startsWith('http') ? item.images[0] : `https://ns-jewellery.onrender.com${item.images[0]}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : <ImageIcon className="text-primary/40 m-auto mt-6" />}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-secondary leading-tight">{item.name}</h4>
                    <button 
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{item.category?.name || 'Uncategorized'}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.stock > 0 ? `${item.stock} IN STOCK` : 'OUT OF STOCK'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500 font-medium">{item.weight}g • {item.purity}</p>
                    {item.basePrice && <p className="text-sm font-serif font-bold text-secondary">₹{item.basePrice.toLocaleString()}</p>}
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-gray-400 text-center py-8 col-span-2 font-medium">No items found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JewelleryManagement;
