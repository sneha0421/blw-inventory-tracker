import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { InventoryPage } from './pages/InventoryPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ItemModal } from './components/ItemModal';
import { api } from './services/api';
import { Item, Transaction, ItemFormData, TransactionFormData } from './types/inventory';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'transactions'>('dashboard');
  
  const [items, setItems] = useState<Item[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState<boolean>(false);

  // Load All Data from REST API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [itemsData, lowStockData, txData] = await Promise.all([
        api.getItems(),
        api.getLowStockItems(),
        api.getTransactions()
      ]);

      setItems(itemsData);
      setLowStockItems(lowStockData);
      setTransactions(txData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Inventory API';
      console.error('API Error:', err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Submit Add or Edit Form
  const handleItemSubmit = async (formData: ItemFormData) => {
    try {
      setIsSubmittingItem(true);
      if (editingItem) {
        await api.updateItem(editingItem.id, formData);
      } else {
        await api.addItem(formData);
      }
      await loadData();
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Delete Item Handler
  const handleDeleteItem = async (id: string) => {
    await api.deleteItem(id);
    await loadData();
  };

  // Record Stock Transaction Handler
  const handleRecordTransaction = async (formData: TransactionFormData) => {
    await api.recordTransaction(formData);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockItems.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            items={items}
            lowStockItems={lowStockItems}
            transactions={transactions}
            onOpenAddItem={handleOpenAddModal}
            onNavigateToTransactions={() => setActiveTab('transactions')}
            onNavigateToInventory={() => setActiveTab('inventory')}
            isLoading={isLoading}
            error={error}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryPage
            items={items}
            onOpenAddItem={handleOpenAddModal}
            onEditItem={handleOpenEditModal}
            onDeleteItem={handleDeleteItem}
            onRefresh={loadData}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsPage
            items={items}
            transactions={transactions}
            onRecordTransaction={handleRecordTransaction}
            isLoading={isLoading}
          />
        )}

      </main>

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleItemSubmit}
        itemToEdit={editingItem}
        isLoading={isSubmittingItem}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BLW Industrial Inventory Tracking System &copy; 2026</span>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Client: React + TS + Tailwind v3</span>
            <span>•</span>
            <span>Server: Express + Firebase Admin (REST)</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
