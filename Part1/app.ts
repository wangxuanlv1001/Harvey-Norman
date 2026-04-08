// PROG2005 Assessment 2 - Part 1
// Author: 吕望轩
// Date: April 2026
// Description: TypeScript-based Inventory Management System for Harvey Norman
// Enhanced: Inline delete confirmation, edit by search, ID readonly on edit.

interface Item {
  id: string;
  name: string;
  category: 'Electronics' | 'Furniture' | 'Clothing' | 'Tools' | 'Miscellaneous';
  quantity: number;
  price: number;
  supplier: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  popular: boolean;
  comment?: string;
}

let items: Item[] = [
  {
    id: "ITEM001",
    name: "Samsung 55 Inch OLED TV",
    category: "Electronics",
    quantity: 12,
    price: 1299.99,
    supplier: "Samsung Australia",
    stockStatus: "In Stock",
    popular: true,
    comment: "Best selling TV this month"
  },
  {
    id: "ITEM002",
    name: "Office Executive Chair",
    category: "Furniture",
    quantity: 8,
    price: 349.50,
    supplier: "Herman Miller",
    stockStatus: "Low Stock",
    popular: false
  },
  {
    id: "ITEM003",
    name: "Leather Jacket",
    category: "Clothing",
    quantity: 25,
    price: 189.99,
    supplier: "Levi's",
    stockStatus: "In Stock",
    popular: true,
    comment: "Popular winter item"
  }
];

// 用于编辑时记录原名称
let currentEditOriginalName: string | null = null;

// 用于存储当前显示删除确认行的商品名称（同一时间只有一个）
let currentDeleteConfirmName: string | null = null;

function showFeedback(message: string, type: 'success' | 'error'): void {
  const feedbackDiv = document.getElementById('feedback') as HTMLDivElement;
  if (feedbackDiv) {
    feedbackDiv.textContent = message;
    feedbackDiv.className = `feedback ${type}`;
    setTimeout(() => {
      feedbackDiv.textContent = '';
      feedbackDiv.className = 'feedback';
    }, 3000);
  }
}

function clearForm(): void {
  (document.getElementById('itemId') as HTMLInputElement).value = '';
  (document.getElementById('itemName') as HTMLInputElement).value = '';
  (document.getElementById('category') as HTMLSelectElement).value = 'Electronics';
  (document.getElementById('quantity') as HTMLInputElement).value = '';
  (document.getElementById('price') as HTMLInputElement).value = '';
  (document.getElementById('supplier') as HTMLInputElement).value = '';
  (document.getElementById('stockStatus') as HTMLSelectElement).value = 'In Stock';
  (document.getElementById('popular') as HTMLInputElement).checked = false;
  (document.getElementById('comment') as HTMLTextAreaElement).value = '';
  // 编辑模式下，ID 应恢复为可编辑
  const idInput = document.getElementById('itemId') as HTMLInputElement;
  idInput.removeAttribute('readonly');
  currentEditOriginalName = null;
  // 同时清除搜索框
  const searchEditInput = document.getElementById('searchEditName') as HTMLInputElement;
  if (searchEditInput) searchEditInput.value = '';
}

function populateCategorySelect(): void {
  const categorySelect = document.getElementById('category') as HTMLSelectElement;
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// 渲染表格，同时处理删除确认行的动态添加（非模态）
function renderTable(filteredItems: Item[] = items): void {
  const tbody = document.querySelector('#inventoryTable tbody') as HTMLTableSectionElement;
  if (!tbody) return;
  tbody.innerHTML = '';

  filteredItems.forEach(item => {
    const row = tbody.insertRow();
    row.setAttribute('data-name', item.name);
    row.innerHTML = `
      <td>${escapeHtml(item.id)}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${escapeHtml(item.supplier)}</td>
      <td>${item.stockStatus}</td>
      <td>${item.popular ? 'Yes' : 'No'}</td>
      <td>${item.comment ? escapeHtml(item.comment) : '-'}</td>
      <td>
        <button class="btn-edit" data-name="${escapeHtml(item.name).replace(/'/g, "\\'")}">Edit</button>
        <button class="btn-delete" data-name="${escapeHtml(item.name).replace(/'/g, "\\'")}">Delete</button>
      </td>
    `;
  });

  // 绑定编辑和删除按钮事件（动态绑定）
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.removeEventListener('click', editButtonHandler);
    btn.addEventListener('click', editButtonHandler);
  });
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.removeEventListener('click', deleteButtonHandler);
    btn.addEventListener('click', deleteButtonHandler);
  });
}

// 编辑按钮处理：自动填充搜索框并触发加载
function editButtonHandler(event: Event): void {
  const btn = event.currentTarget as HTMLButtonElement;
  const name = btn.getAttribute('data-name');
  if (name) {
    const searchInput = document.getElementById('searchEditName') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = name;
      loadForEdit();
    }
  }
}

// 删除按钮处理：显示内联确认行
function deleteButtonHandler(event: Event): void {
  const btn = event.currentTarget as HTMLButtonElement;
  const name = btn.getAttribute('data-name');
  if (name) {
    showInlineDeleteConfirm(name);
  }
}

// 显示内联删除确认（在对应行下方插入一行）
function showInlineDeleteConfirm(name: string): void {
  // 如果已经有确认行，先移除
  removeCurrentDeleteConfirm();
  const tbody = document.querySelector('#inventoryTable tbody') as HTMLTableSectionElement;
  const rows = tbody.querySelectorAll('tr');
  let targetRow: HTMLTableRowElement | null = null;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firstCell = row.cells[0];
    if (firstCell && firstCell.textContent?.trim() === name) {
      targetRow = row;
      break;
    }
  }
  if (!targetRow) return;

  const confirmRow = tbody.insertRow(targetRow.rowIndex + 1);
  confirmRow.className = 'confirm-row';
  const cell = confirmRow.insertCell(0);
  cell.colSpan = 10;
  cell.innerHTML = `
    <div class="confirm-box">
      <span>Are you sure you want to delete "${escapeHtml(name)}"?</span>
      <button class="confirm-yes" data-name="${escapeHtml(name)}">Yes</button>
      <button class="confirm-no">No</button>
    </div>
  `;
  currentDeleteConfirmName = name;

  // 绑定确认按钮事件
  const yesBtn = confirmRow.querySelector('.confirm-yes') as HTMLButtonElement;
  const noBtn = confirmRow.querySelector('.confirm-no') as HTMLButtonElement;
  yesBtn.addEventListener('click', () => {
    deleteItemByName(name);
    removeCurrentDeleteConfirm();
  });
  noBtn.addEventListener('click', () => {
    removeCurrentDeleteConfirm();
  });
}

function removeCurrentDeleteConfirm(): void {
  const confirmRow = document.querySelector('#inventoryTable .confirm-row');
  if (confirmRow) confirmRow.remove();
  currentDeleteConfirmName = null;
}

function deleteItemByName(name: string): void {
  const index = items.findIndex(item => item.name === name);
  if (index !== -1) {
    items.splice(index, 1);
    showFeedback(`Product "${name}" deleted successfully!`, 'success');
    renderTable();
  } else {
    showFeedback(`Error: Product "${name}" not found.`, 'error');
  }
}

// 搜索并加载到表单（编辑模式）
function loadForEdit(): void {
  const searchInput = document.getElementById('searchEditName') as HTMLInputElement;
  const name = searchInput.value.trim();
  if (!name) {
    showFeedback('Please enter a product name to edit.', 'error');
    return;
  }
  const item = items.find(i => i.name === name);
  if (!item) {
    showFeedback(`Product "${name}" not found.`, 'error');
    return;
  }
  // 填充表单
  (document.getElementById('itemId') as HTMLInputElement).value = item.id;
  (document.getElementById('itemName') as HTMLInputElement).value = item.name;
  (document.getElementById('category') as HTMLSelectElement).value = item.category;
  (document.getElementById('quantity') as HTMLInputElement).value = item.quantity.toString();
  (document.getElementById('price') as HTMLInputElement).value = item.price.toString();
  (document.getElementById('supplier') as HTMLInputElement).value = item.supplier;
  (document.getElementById('stockStatus') as HTMLSelectElement).value = item.stockStatus;
  (document.getElementById('popular') as HTMLInputElement).checked = item.popular;
  (document.getElementById('comment') as HTMLTextAreaElement).value = item.comment || '';
  
  // 设置 ID 输入框为只读（不可修改）
  const idInput = document.getElementById('itemId') as HTMLInputElement;
  idInput.setAttribute('readonly', 'readonly');
  
  currentEditOriginalName = item.name;
  showFeedback(`Loaded "${item.name}" for editing. You can modify fields (ID is readonly).`, 'success');
}

// 添加或更新商品（核心逻辑）
function addOrUpdateItem(): void {
  const idInput = document.getElementById('itemId') as HTMLInputElement;
  const id = idInput.value.trim();
  const name = (document.getElementById('itemName') as HTMLInputElement).value.trim();
  const category = (document.getElementById('category') as HTMLSelectElement).value as Item['category'];
  const quantity = parseFloat((document.getElementById('quantity') as HTMLInputElement).value);
  const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);
  const supplier = (document.getElementById('supplier') as HTMLInputElement).value.trim();
  const stockStatus = (document.getElementById('stockStatus') as HTMLSelectElement).value as Item['stockStatus'];
  const popular = (document.getElementById('popular') as HTMLInputElement).checked;
  const comment = (document.getElementById('comment') as HTMLTextAreaElement).value.trim();

  // 验证
  if (!id || !name || !supplier) {
    showFeedback('Error: Item ID, Product Name, and Supplier are required!', 'error');
    return;
  }
  if (isNaN(quantity) || quantity < 0) {
    showFeedback('Error: Quantity must be a non-negative number.', 'error');
    return;
  }
  if (isNaN(price) || price <= 0) {
    showFeedback('Error: Price must be greater than 0.', 'error');
    return;
  }

  // 编辑模式（有 currentEditOriginalName）
  if (currentEditOriginalName !== null) {
    const existingItem = items.find(item => item.name === currentEditOriginalName);
    if (!existingItem) {
      showFeedback('Error: The product to edit no longer exists.', 'error');
      clearForm();
      renderTable();
      return;
    }
    // 检查新ID是否与其他商品冲突（排除自身）
    if (existingItem.id !== id && items.some(item => item.id === id && item.name !== currentEditOriginalName)) {
      showFeedback('Error: This Item ID is already used by another product.', 'error');
      return;
    }
    // 检查新名称是否与其他商品冲突（排除自身）
    if (existingItem.name !== name && items.some(item => item.name === name && item.name !== currentEditOriginalName)) {
      showFeedback('Error: This product name is already used by another product.', 'error');
      return;
    }

    // 更新所有字段（ID 保持不变，因为只读，实际 id 值来自表单但不会改变）
    existingItem.id = id;
    existingItem.name = name;
    existingItem.category = category;
    existingItem.quantity = quantity;
    existingItem.price = price;
    existingItem.supplier = supplier;
    existingItem.stockStatus = stockStatus;
    existingItem.popular = popular;
    existingItem.comment = comment || undefined;

    showFeedback(`Product "${name}" updated successfully!`, 'success');
    clearForm();
    renderTable();
    return;
  }

  // 新增模式：检查 ID 和名称唯一性
  if (items.some(item => item.id === id)) {
    showFeedback('Error: Item ID already exists!', 'error');
    return;
  }
  if (items.some(item => item.name === name)) {
    showFeedback('Error: Product name already exists!', 'error');
    return;
  }

  const newItem: Item = {
    id, name, category, quantity, price, supplier, stockStatus, popular,
    comment: comment || undefined
  };
  items.push(newItem);
  showFeedback(`Product "${name}" added successfully!`, 'success');
  clearForm();
  renderTable();
}

function searchItem(): void {
  const keyword = (document.getElementById('searchInput') as HTMLInputElement).value.toLowerCase().trim();
  if (!keyword) {
    showFeedback('Please enter a search keyword.', 'error');
    return;
  }
  const filtered = items.filter(item => item.name.toLowerCase().includes(keyword));
  if (filtered.length === 0) {
    showFeedback(`No products found containing "${keyword}".`, 'error');
  }
  renderTable(filtered);
}

function showAllItems(): void {
  (document.getElementById('searchInput') as HTMLInputElement).value = '';
  renderTable(items);
}

function showPopularItems(): void {
  const popularItems = items.filter(item => item.popular);
  if (popularItems.length === 0) {
    showFeedback('No popular items found.', 'error');
    return;
  }
  renderTable(popularItems);
}

// 页面加载初始化
window.onload = function (): void {
  populateCategorySelect();
  renderTable();

  // 绑定搜索输入框回车
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchItem();
  });

  // 绑定“加载编辑”按钮
  const loadEditBtn = document.getElementById('loadEditBtn') as HTMLButtonElement;
  if (loadEditBtn) loadEditBtn.addEventListener('click', loadForEdit);

  // 绑定清空表单按钮（已有 clearForm 函数）
  const clearBtn = document.querySelector('.btn-secondary') as HTMLButtonElement;
  if (clearBtn) clearBtn.addEventListener('click', clearForm);
};