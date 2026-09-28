import React from 'react';
import { Package, IndianRupee, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { Item, Transaction } from '../types/inventory';

interface SummaryCardsProps {
  items: Item[];
  lowStockItems: Item[];
  transactions: Transaction[];
  onCardClick?: (tab: 'inventory' | 'transactions') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  items,
  lowStockItems,
  transactions,
  onCardClick
}) => {
  const totalItemsCount = items.length;
  const totalInventoryValue = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const lowStockCount = lowStockItems.length;
  const totalTransactionsCount = transactions.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Items Card */}
      <div 
        onClick={() => onCardClick?.('inventory')}
        className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg hover:border-slate-600 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items</span>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20 transition">
            <Package className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">{totalItemsCount}</div>
          <p className="text-xs text-slate-400 mt-1">Across 5 Industrial Categories</p>
        </div>
      </div>

      {/* Total Inventory Value Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg hover:border-slate-600 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Value</span>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <IndianRupee className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-1">Sum of (Qty × Unit Price)</p>
        </div>
      </div>

      {/* Low Stock Items Card */}
      <div 
        onClick={() => onCardClick?.('inventory')}
        className={`border rounded-xl p-5 shadow-lg transition cursor-pointer group ${
          lowStockCount > 0 
            ? 'bg-amber-950/30 border-amber-500/50 hover:border-amber-400' 
            : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
          <div className={`p-2.5 rounded-lg border ${
            lowStockCount > 0 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' 
              : 'bg-slate-700 text-slate-400 border-slate-600'
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-bold tracking-tight ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {lowStockCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lowStockCount > 0 ? 'Requires immediate restock' : 'All stock levels healthy'}
          </p>
        </div>
      </div>

      {/* Total Transactions Card */}
      <div 
        onClick={() => onCardClick?.('transactions')}
        className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg hover:border-slate-600 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions</span>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">{totalTransactionsCount}</div>
          <p className="text-xs text-slate-400 mt-1">Stock IN / OUT Audit Records</p>
        </div>
      </div>

    </div>
  );
};
