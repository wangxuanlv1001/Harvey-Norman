import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  totalProducts: number = 0;
  popularItems: number = 0;
  lowStockItems: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.updateStats();
    this.subscription = this.inventoryService.itemsChanged$.subscribe(() => {
      this.updateStats();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateStats(): void {
    const items = this.inventoryService.getItems();
    this.totalProducts = items.length;
    this.popularItems = items.filter(item => item.popular).length;
    this.lowStockItems = items.filter(item => item.stockStatus === 'Low Stock').length;
  }
}