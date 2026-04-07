import { Injectable } from '@angular/core';
import { Item } from './models/item';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private items: Item[] = [
    { id: "ITEM001", name: "Samsung 55 Inch OLED TV", category: "Electronics", quantity: 12, price: 1299.99, supplier: "Samsung Australia", stockStatus: "In Stock", popular: true, comment: "Best selling TV this month" },
    { id: "ITEM002", name: "Office Executive Chair", category: "Furniture", quantity: 8, price: 349.50, supplier: "Herman Miller", stockStatus: "Low Stock", popular: false },
    { id: "ITEM003", name: "Leather Jacket", category: "Clothing", quantity: 25, price: 189.99, supplier: "Levi's", stockStatus: "In Stock", popular: true, comment: "Popular winter item" }
  ];

  getItems(): Item[] { return [...this.items]; }
  getPopularItems(): Item[] { return this.items.filter(item => item.popular); }
  searchByName(keyword: string): Item[] {
    const lower = keyword.toLowerCase();
    return this.items.filter(item => item.name.toLowerCase().includes(lower));
  }
  addItem(item: Item): { success: boolean; message: string } {
    if (this.items.some(i => i.id === item.id)) return { success: false, message: 'Item ID already exists!' };
    if (this.items.some(i => i.name === item.name)) return { success: false, message: 'Product name already exists!' };
    this.items.push({ ...item });
    return { success: true, message: `Product "${item.name}" added successfully!` };
  }
  updateItem(originalName: string, updated: Item): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name === originalName);
    if (index === -1) return { success: false, message: 'Product not found!' };
    const existing = this.items[index];
    if (existing.id !== updated.id && this.items.some(i => i.id === updated.id))
      return { success: false, message: 'New Item ID already used by another product!' };
    if (existing.name !== updated.name && this.items.some(i => i.name === updated.name))
      return { success: false, message: 'New product name already used!' };
    this.items[index] = { ...updated };
    return { success: true, message: `Product "${updated.name}" updated successfully!` };
  }
  deleteItem(name: string): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name === name);
    if (index === -1) return { success: false, message: 'Product not found!' };
    this.items.splice(index, 1);
    return { success: true, message: `Product "${name}" deleted successfully!` };
  }
}