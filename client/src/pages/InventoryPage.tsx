import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Item, ITEM_CATEGORIES } from '../types/inventory';

interface InventoryPageProps {
  items: Item[];
  onOpenAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  items,
  onOpenAddItem,
  onEditItem,
  onDeleteItem,
  onRefresh,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      try {
        setDeletingId(id);
        await onDeleteItem(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Spare Parts & Inventory Registry</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete database of industrial tools, consumables, and mechanical components.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Inventory"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenAddItem}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Controls: Search Bar + Category Dropdown */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-56 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="ALL">All Categories ({items.length})</option>
            {ITEM_CATEGORIES.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
        </div>

      </div>

      {/* Items Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Stock Level</th>
                <th className="px-6 py-4 text-right">Min Stock</th>
                <th className="px-6 py-4 text-right">Unit Price</th>
                <th className="px-6 py-4 text-right">Total Value</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 animate-pulse">
                    Loading inventory registry...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No items match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.quantity <= item.minStock;
                  const isOutOfStock = item.quantity === 0;
                  const totalVal = item.quantity * item.unitPrice;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/50 transition ${
                        isLowStock ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <span>{item.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock Level Badge */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border">
                          {isOutOfStock ? (
                            <span className="bg-red-950 text-red-400 border-red-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              0 (Out of Stock)
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-950 text-amber-400 border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {item.quantity} Low Stock
                            </span>
                          ) : (
                            <span className="bg-emerald-950 text-emerald-400 border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              {item.quantity} In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Min Stock */}
                      <td className="px-6 py-4 text-right font-mono text-slate-400">
                        {item.minStock}
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4 text-right font-mono font-medium text-slate-200">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Total Value */}
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                        ₹{totalVal.toLocaleString('en-IN')}
                      </td>

                      {/* Action Buttons: Edit & Delete */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="Edit Item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            disabled={deletingId === item.id}
                            className="p-1.5 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition disabled:opacity-50"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredItems.length} of {items.length} items</span>
          <span>Filtered by: {selectedCategory === 'ALL' ? 'All Categories' : selectedCategory}</span>
        </div>

      </div>

    </div>
  );
};
