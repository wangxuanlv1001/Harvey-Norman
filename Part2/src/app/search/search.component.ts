import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { Item } from '../models/item';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  keyword = '';
  results: Item[] = [];
  message = '';

  constructor(private inventoryService: InventoryService) {}

  search(): void {
    if (!this.keyword.trim()) {
      this.message = 'Please enter a search keyword.';
      this.results = [];
      setTimeout(() => this.message = '', 3000);
      return;
    }
    this.results = this.inventoryService.searchByName(this.keyword);
    if (this.results.length === 0) {
      this.message = `No products found containing "${this.keyword}".`;
      setTimeout(() => this.message = '', 3000);
    }
  }

  clear(): void {
    this.keyword = '';
    this.results = [];
    this.message = '';
  }
}
