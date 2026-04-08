import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { Item } from '../models/item';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent implements OnInit {
  // 表单组
  itemForm: FormGroup;
  // 当前正在编辑的商品的原名称（用于更新时定位）
  editingOriginalName: string | null = null;
  // 反馈消息
  message = '';
  messageType: 'success' | 'error' = 'success';
  // 类别和库存状态选项
  categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
  // 独立搜索框绑定的值
  searchName: string = '';

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    // 初始化表单，ID 默认禁用（编辑时启用但设为只读？这里直接设为禁用，但保存时通过 getRawValue 获取值）
    this.itemForm = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
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
    // 如果从列表页传递了 editName，则自动填充搜索框并加载
    const state = history.state;
    if (state && state['editName']) {
      this.searchName = state['editName'];
      this.loadForEdit();
    }
  }

  // 手动搜索加载
  loadForEdit(): void {
    const name = this.searchName.trim();
    if (!name) {
      this.showMessage('Please enter a product name to edit.', 'error');
      return;
    }
    const items = this.inventoryService.getItems();
    const item = items.find(i => i.name === name);
    if (!item) {
      this.showMessage(`Product "${name}" not found.`, 'error');
      return;
    }
    // 填充表单（ID 会被自动禁用）
    this.itemForm.patchValue({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      supplier: item.supplier,
      stockStatus: item.stockStatus,
      popular: item.popular,
      comment: item.comment || ''
    });
    // 确保 ID 字段是禁用的（不可修改）
    this.itemForm.get('id')?.disable();
    this.editingOriginalName = item.name;
    this.showMessage(`Loaded "${item.name}" for editing. ID is readonly.`, 'success');
  }

  // 保存（添加或更新）
  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showMessage('Please fill all required fields correctly.', 'error');
      return;
    }
    // 获取包含禁用字段的值（ID）
    const formValue = this.itemForm.getRawValue();
    const item: Item = {
      id: formValue.id.trim(),
      name: formValue.name.trim(),
      category: formValue.category,
      quantity: formValue.quantity,
      price: formValue.price,
      supplier: formValue.supplier.trim(),
      stockStatus: formValue.stockStatus,
      popular: formValue.popular,
      comment: formValue.comment?.trim() || undefined
    };
    let result;
    if (this.editingOriginalName) {
      // 编辑模式：使用原名称更新（允许修改名称）
      result = this.inventoryService.updateItem(this.editingOriginalName, item);
    } else {
      // 新增模式
      result = this.inventoryService.addItem(item);
    }
    this.showMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      this.resetForm();
    }
  }

  // 重置表单（清空编辑状态，启用 ID 字段）
  resetForm(): void {
    this.itemForm.reset({
      category: 'Electronics',
      stockStatus: 'In Stock',
      popular: false,
      quantity: 0,
      price: 0
    });
    this.itemForm.get('id')?.enable();
    this.editingOriginalName = null;
    this.searchName = '';
    this.showMessage('Form cleared. Ready to add new product.', 'success');
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }
}