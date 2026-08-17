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
      }
    } catch (error) {
      console.error('Failed to create category:', error);
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
      }
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Jewellery Catalogue</h2>
        <div className="flex space-x-4">
          <button onClick={() => setIsAddingCategory(true)} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary/90 transition-colors">
            <Plus size={20} />
            <span>Add Category</span>
          </button>
          <button onClick={() => setIsAddingItem(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors">
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {isAddingCategory && (
        <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">New Category</h3>
            <button type="button" onClick={() => setIsAddingCategory(false)}><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input required type="text" placeholder="Category Name (e.g. Long Haram)" value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" />
            <input type="file" accept="image/*" onChange={e => setCatImage(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
          </div>
          <button type="submit" className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary/90">Save Category</button>
        </form>
      )}

      {isAddingItem && (
        <form onSubmit={handleCreateItem} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">New Jewellery Item</h3>
            <button type="button" onClick={() => setIsAddingItem(false)}><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input required type="text" placeholder="Item Name (e.g. Haram Indo Kuwait)" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" />
            <select required value={itemCategoryId} onChange={e => setItemCategoryId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Weight (g)" value={itemWeight} onChange={e => setItemWeight(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary" />
            <select value={itemPurity} onChange={e => setItemPurity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary">
              <option value="22K">22K</option>
              <option value="24K">24K</option>
              <option value="18K">18K</option>
            </select>
            <input type="file" accept="image/*" onChange={e => setItemImage(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">Save Item</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Purity & Weight</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  {item.images?.[0] ? (
                    <img src={`http://localhost:5000${item.images[0]}`} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-800">{item.name}</div>
                </td>
                <td className="p-4 text-gray-600">{item.category?.name}</td>
                <td className="p-4 text-gray-600">{item.purity} • {item.weight}g</td>
                <td className="p-4 flex justify-end space-x-2">
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No jewellery items found. Add some!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JewelleryManagement;
