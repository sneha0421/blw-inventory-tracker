export type ItemCategory = 
  | 'Mechanical' 
  | 'Electrical' 
  | 'Tools' 
  | 'Consumables' 
  | 'Safety Gear';

export const ITEM_CATEGORIES: ItemCategory[] = [
  'Mechanical',
  'Electrical',
  'Tools',
  'Consumables',
  'Safety Gear'
];

export interface Item {
  id: string;
  name: string;
  category: ItemCategory | string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  lastUpdated: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  reason: string;
  date: string;
}

export interface ItemFormData {
  name: string;
  category: ItemCategory;
  quantity: number | '';
  minStock: number | '';
  unitPrice: number | '';
}

export interface TransactionFormData {
  itemId: string;
  type: TransactionType;
  quantity: number | '';
  reason: string;
}
