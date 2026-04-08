import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryService } from '../inventory.service';
import { Item } from '../models/item';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit {
  items: Item[] = [];
  showPopularOnly = false;
  message = '';

  // 用于记录当前显示确认框的商品名称（同一时间只显示一个）
  confirmItemName: string | null = null;

  constructor(private inventoryService: InventoryService, private router: Router) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.items = this.showPopularOnly ? this.inventoryService.getPopularItems() : this.inventoryService.getItems();
  }

  togglePopularFilter(): void {
    this.showPopularOnly = !this.showPopularOnly;
    this.loadItems();
  }

  editItem(name: string): void {
    this.router.navigate(['/manage'], { state: { editName: name } });
  }

  // 显示删除确认行
  showDeleteConfirm(name: string): void {
    this.confirmItemName = name;
  }

  // 取消删除
  cancelDelete(): void {
    this.confirmItemName = null;
  }

  // 确认删除
  confirmDelete(name: string): void {
    const result = this.inventoryService.deleteItem(name);
    this.message = result.message;
    setTimeout(() => this.message = '', 3000);
    this.loadItems();
    this.confirmItemName = null;
  }
}