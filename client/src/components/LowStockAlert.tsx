import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Item } from '../types/inventory';

interface LowStockAlertProps {
  items: Item[];
  onNavigateToTransactions: () => void;
  onNavigateToInventory: () => void;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  items,
  onNavigateToTransactions,
  onNavigateToInventory
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-400">Stock Levels Optimal</h4>
            <p className="text-xs text-slate-400">All inventory items are currently above minimum stock thresholds.</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded-md border border-emerald-800 font-medium">
          0 Alerts
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-red-950/30 border border-amber-500/40 rounded-xl p-5 shadow-lg shadow-amber-950/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-amber-200">Critical Low Stock Warning</h3>
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <p className="text-xs text-amber-300/80 mt-0.5">
              The following spare parts or consumables have dropped at or below their minimum required threshold.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateToTransactions}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition shadow-md shadow-amber-500/20 flex items-center space-x-1.5"
          >
            <span>Record Stock IN</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Low Stock Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {items.map(item => {
          const deficit = item.minStock - item.quantity;
          const isCritical = item.quantity === 0;

          return (
            <div
              key={item.id}
              onClick={onNavigateToInventory}
              className="bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-lg p-3 cursor-pointer transition flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition">
                    {item.name}
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono mt-1 inline-block">
                    {item.category}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-bold border ${
                    isCritical
                      ? 'bg-red-950 text-red-400 border-red-800 animate-bounce'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {isCritical ? 'OUT OF STOCK' : 'LOW STOCK'}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Current: </span>
                  <span className="font-bold text-red-400">{item.quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400">Min Required: </span>
                  <span className="font-semibold text-slate-200">{item.minStock}</span>
                </div>
                <div>
                  <span className="text-slate-400">Deficit: </span>
                  <span className="font-bold text-amber-400">+{deficit > 0 ? deficit : 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
