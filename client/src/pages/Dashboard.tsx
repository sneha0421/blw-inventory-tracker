import React from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { LowStockAlert } from '../components/LowStockAlert';
import { Item, Transaction } from '../types/inventory';
import { ArrowLeftRight, Plus, AlertCircle, ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react';

interface DashboardProps {
  items: Item[];
  lowStockItems: Item[];
  transactions: Transaction[];
  onOpenAddItem: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToInventory: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  items,
  lowStockItems,
  transactions,
  onOpenAddItem,
  onNavigateToTransactions,
  onNavigateToInventory,
  isLoading = false,
  error = null
}) => {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Industrial Inventory Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring of spare parts, tools, consumables, and low-stock alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAddItem}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Item</span>
          </button>
          
          <button
            onClick={onNavigateToTransactions}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center space-x-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold">Backend Communication Failure</p>
            <p className="text-xs text-red-400/90">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <SummaryCards
        items={items}
        lowStockItems={lowStockItems}
        transactions={transactions}
        onCardClick={(tab) => {
          if (tab === 'inventory') onNavigateToInventory();
          if (tab === 'transactions') onNavigateToTransactions();
        }}
      />

      {/* Low Stock Alert Section */}
      <LowStockAlert
        items={lowStockItems}
        onNavigateToTransactions={onNavigateToTransactions}
        onNavigateToInventory={onNavigateToInventory}
      />

      {/* Recent Transactions Section */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Recent Inventory Transactions</h3>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition"
          >
            <span>View Full History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-sm animate-pulse">
            Loading recent transactions...
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No stock transactions recorded yet. Click "Record Movement" to log stock IN or OUT.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 mt-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-sm hover:bg-slate-800/40 px-2 rounded-lg transition">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.type === 'IN'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {tx.type === 'IN' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-200">{tx.itemName}</div>
                    <div className="text-xs text-slate-400">{tx.reason}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold ${
                      tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'IN' ? '+' : '-'}{tx.quantity} units
                  </span>
                  <div className="text-[11px] text-slate-500">
                    {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
