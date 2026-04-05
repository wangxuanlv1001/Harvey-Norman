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

  constructor(private inventoryService: InventoryService, private router: Router) {}

  ngOnInit(): void { this.loadItems(); }

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

  deleteItem(name: string): void {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const result = this.inventoryService.deleteItem(name);
      this.message = result.message;
      setTimeout(() => this.message = '', 3000);
      this.loadItems();
    }
  }
}
