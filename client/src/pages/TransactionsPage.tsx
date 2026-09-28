import React, { useState } from 'react';
import { ArrowLeftRight, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle, Plus, Minus } from 'lucide-react';
import { Item, Transaction, TransactionFormData, TransactionType } from '../types/inventory';

interface TransactionsPageProps {
  items: Item[];
  transactions: Transaction[];
  onRecordTransaction: (data: TransactionFormData) => Promise<void>;
  isLoading?: boolean;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  items,
  transactions,
  onRecordTransaction,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    itemId: items.length > 0 ? items[0].id : '',
    type: 'IN',
    quantity: '',
    reason: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedItem = items.find((i) => i.id === formData.itemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.itemId) {
      setErrorMsg('Please select an inventory item.');
      return;
    }
    if (formData.quantity === '' || Number(formData.quantity) <= 0) {
      setErrorMsg('Quantity must be greater than 0.');
      return;
    }
    if (!formData.reason.trim()) {
      setErrorMsg('Please provide a reason or reference note for this stock movement.');
      return;
    }

    if (formData.type === 'OUT' && selectedItem && selectedItem.quantity < Number(formData.quantity)) {
      setErrorMsg(`Insufficient stock for "${selectedItem.name}". Available: ${selectedItem.quantity}, Requested: ${formData.quantity}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onRecordTransaction(formData);
      setSuccessMsg(`Successfully recorded Stock ${formData.type} for "${selectedItem?.name || 'Item'}"!`);
      
      // Reset quantity and reason
      setFormData((prev) => ({
        ...prev,
        quantity: '',
        reason: ''
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record transaction';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Stock Movement & Audit Log</h1>
        <p className="text-sm text-slate-400 mt-1">
          Record stock arrivals (IN) or dispatch/usage (OUT) and trace history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Card (1 Column) */}
        <div className="lg:col-span-1 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl h-fit">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-700 mb-5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Record Stock Transaction</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Select Item */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Select Inventory Item *
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                {items.length === 0 ? (
                  <option value="">No items available</option>
                ) : (
                  items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category}) - Available: {item.quantity}
                    </option>
                  ))
                )}
              </select>
              {selectedItem && (
                <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
                  <span>Current Stock: <strong className="text-slate-200">{selectedItem.quantity}</strong></span>
                  <span>Min Stock: <strong className="text-slate-200">{selectedItem.minStock}</strong></span>
                </div>
              )}
            </div>

            {/* Transaction Type Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Transaction Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'IN' })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    formData.type === 'IN'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>STOCK IN (+ Arrival)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'OUT' })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    formData.type === 'OUT'
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  <span>STOCK OUT (- Issue)</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Quantity Units *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Reason / Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Reason / Reference Note *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Received shipment from Supplier X / Issued for Assembly Line #2"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition shadow-lg flex items-center justify-center space-x-2 ${
                formData.type === 'IN'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  <span>Record Stock {formData.type}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* History Table Card (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
            <h2 className="text-lg font-bold text-white">Transaction History</h2>
            <span className="text-xs text-slate-400">{transactions.length} Total Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 animate-pulse">
                      Loading transaction logs...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No stock transaction history recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {tx.itemName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            tx.type === 'IN'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-red-950 text-red-400 border-red-800'
                          }`}
                        >
                          {tx.type === 'IN' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-bold ${
                          tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">
                        {tx.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
