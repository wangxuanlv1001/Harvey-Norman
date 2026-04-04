import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { Item } from '../models/item';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-form.html',
  styleUrls: ['./inventory-form.css']
})
export class InventoryFormComponent implements OnInit {
  itemForm: FormGroup;
  editingOriginalName: string | null = null;
  message = '';
  messageType: 'success' | 'error' = 'success';
  categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.itemForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      category: ['Electronics', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      supplier: ['', Validators.required],
      stockStatus: ['In Stock', Validators.required],
      popular: [false],
      comment: ['']
    });
  }

  ngOnInit(): void {
    const state = history.state;
    if (state && state['editName']) {
      this.loadItemForEdit(state['editName']);
    }
  }

  loadItemForEdit(name: string): void {
    const items = this.inventoryService.getItems();
    const item = items.find(i => i.name === name);
    if (item) {
      this.editingOriginalName = item.name;
      this.itemForm.patchValue({
        id: item.id, name: item.name, category: item.category,
        quantity: item.quantity, price: item.price, supplier: item.supplier,
        stockStatus: item.stockStatus, popular: item.popular, comment: item.comment || ''
      });
    }
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showMessage('请正确填写所有必填字段（ID、名称、供应商、数量≥0、价格>0）', 'error');
      return;
    }
    const val = this.itemForm.value;
    const item: Item = {
      id: val.id.trim(), name: val.name.trim(), category: val.category,
      quantity: val.quantity, price: val.price, supplier: val.supplier.trim(),
      stockStatus: val.stockStatus, popular: val.popular, comment: val.comment?.trim() || undefined
    };
    let result;
    if (this.editingOriginalName) {
      result = this.inventoryService.updateItem(this.editingOriginalName, item);
    } else {
      result = this.inventoryService.addItem(item);
    }
    this.showMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) this.resetForm();
  }

  resetForm(): void {
    this.itemForm.reset({ category: 'Electronics', stockStatus: 'In Stock', popular: false, quantity: 0, price: 0 });
    this.editingOriginalName = null;
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg; this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }
}