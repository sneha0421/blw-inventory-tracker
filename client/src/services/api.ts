import { Item, Transaction, ItemFormData, TransactionFormData } from '../types/inventory';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && (errorData.error || errorData.message)) {
        errorMessage = errorData.error || errorData.message;
      }
    } catch {
      // If parsing json fails, use standard status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // Items API
  async getItems(): Promise<Item[]> {
    const res = await fetch(`${BASE_URL}/api/items`);
    return handleResponse<Item[]>(res);
  },

  async getLowStockItems(): Promise<Item[]> {
    const res = await fetch(`${BASE_URL}/api/items/low-stock`);
    return handleResponse<Item[]>(res);
  },

  async addItem(data: ItemFormData): Promise<Item> {
    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        category: data.category,
        quantity: Number(data.quantity),
        minStock: Number(data.minStock),
        unitPrice: Number(data.unitPrice)
      })
    });
    return handleResponse<Item>(res);
  },

  async updateItem(id: string, data: Partial<ItemFormData>): Promise<Item> {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.category !== undefined) body.category = data.category;
    if (data.quantity !== undefined && data.quantity !== '') body.quantity = Number(data.quantity);
    if (data.minStock !== undefined && data.minStock !== '') body.minStock = Number(data.minStock);
    if (data.unitPrice !== undefined && data.unitPrice !== '') body.unitPrice = Number(data.unitPrice);

    const res = await fetch(`${BASE_URL}/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse<Item>(res);
  },

  async deleteItem(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${BASE_URL}/api/items/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  // Transactions API
  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${BASE_URL}/api/transactions`);
    return handleResponse<Transaction[]>(res);
  },

  async recordTransaction(data: TransactionFormData): Promise<Transaction & { updatedItemQuantity: number }> {
    const res = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: data.itemId,
        type: data.type,
        quantity: Number(data.quantity),
        reason: data.reason
      })
    });
    return handleResponse<Transaction & { updatedItemQuantity: number }>(res);
  }
};
