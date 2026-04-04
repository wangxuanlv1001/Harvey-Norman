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
    if (this.items.some(i => i.id === item.id)) return { success: false, message: 'Item ID 已存在！' };
    if (this.items.some(i => i.name === item.name)) return { success: false, message: '商品名称已存在！' };
    this.items.push({ ...item });
    return { success: true, message: `商品 "${item.name}" 添加成功！` };
  }
  updateItem(originalName: string, updated: Item): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name === originalName);
    if (index === -1) return { success: false, message: '商品不存在！' };
    const existing = this.items[index];
    if (existing.id !== updated.id && this.items.some(i => i.id === updated.id))
      return { success: false, message: '新 Item ID 已被其他商品使用！' };
    if (existing.name !== updated.name && this.items.some(i => i.name === updated.name))
      return { success: false, message: '新商品名称已被其他商品使用！' };
    this.items[index] = { ...updated };
    return { success: true, message: `商品 "${updated.name}" 更新成功！` };
  }
  deleteItem(name: string): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name === name);
    if (index === -1) return { success: false, message: '商品不存在！' };
    this.items.splice(index, 1);
    return { success: true, message: `商品 "${name}" 已删除！` };
  }
}