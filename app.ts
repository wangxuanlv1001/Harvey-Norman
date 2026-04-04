// PROG2005 Assessment 2 - Part 1
// Author: 吕望轩
// Date: April 2026
// Last updated: 2026-04-04 - Minor tweak for commit count
// Description: TypeScript-based Inventory Management System for Harvey Norman

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

// 用于记录正在编辑的商品的原名称（用于更新时定位）
let currentEditOriginalName: string | null = null;

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
  // 清空编辑标记
  currentEditOriginalName = null;
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

function renderTable(filteredItems: Item[] = items): void {
  const tbody = document.querySelector('#inventoryTable tbody') as HTMLTableSectionElement;
  if (!tbody) return;
  tbody.innerHTML = '';

  filteredItems.forEach(item => {
    const row = tbody.insertRow();
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
        <button class="btn-edit" onclick="editItem('${escapeHtml(item.name).replace(/'/g, "\\'")}')">编辑</button>
        <button class="btn-delete" onclick="deleteItem('${escapeHtml(item.name).replace(/'/g, "\\'")}')">删除</button>
      </td>
    `;
  });
}

// 简单的防XSS辅助函数
function escapeHtml(str: string): string {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}

function addOrUpdateItem(): void {
  const id = (document.getElementById('itemId') as HTMLInputElement).value.trim();
  const name = (document.getElementById('itemName') as HTMLInputElement).value.trim();
  const category = (document.getElementById('category') as HTMLSelectElement).value as Item['category'];
  const quantity = parseFloat((document.getElementById('quantity') as HTMLInputElement).value);
  const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);
  const supplier = (document.getElementById('supplier') as HTMLInputElement).value.trim();
  const stockStatus = (document.getElementById('stockStatus') as HTMLSelectElement).value as Item['stockStatus'];
  const popular = (document.getElementById('popular') as HTMLInputElement).checked;
  const comment = (document.getElementById('comment') as HTMLTextAreaElement).value.trim();

  // 必填字段验证
  if (!id || !name || !supplier) {
    showFeedback('错误：Item ID、商品名称和供应商为必填字段！', 'error');
    return;
  }
  if (isNaN(quantity) || quantity < 0) {
    showFeedback('错误：数量必须是有效的非负数字！', 'error');
    return;
  }
  if (isNaN(price) || price <= 0) {
    showFeedback('错误：价格必须是大于0的数字！', 'error');
    return;
  }

  // 编辑模式：有 currentEditOriginalName
  if (currentEditOriginalName !== null) {
    // 查找原商品
    const existingItem = items.find(item => item.name === currentEditOriginalName);
    if (!existingItem) {
      showFeedback('错误：要编辑的商品不存在！', 'error');
      clearForm();
      return;
    }

    // 检查新 ID 是否与其他商品冲突（排除自身）
    if (existingItem.id !== id && items.some(item => item.id === id)) {
      showFeedback('错误：该 Item ID 已被其他商品使用！', 'error');
      return;
    }
    // 检查新名称是否与其他商品冲突（排除自身）
    if (existingItem.name !== name && items.some(item => item.name === name)) {
      showFeedback('错误：该商品名称已被其他商品使用！', 'error');
      return;
    }

    // 更新所有字段
    existingItem.id = id;
    existingItem.name = name;
    existingItem.category = category;
    existingItem.quantity = quantity;
    existingItem.price = price;
    existingItem.supplier = supplier;
    existingItem.stockStatus = stockStatus;
    existingItem.popular = popular;
    existingItem.comment = comment || undefined;

    showFeedback(`商品 "${name}" 更新成功！`, 'success');
    clearForm();
    renderTable();
    return;
  }

  // 新增模式：检查 ID 和名称是否唯一
  if (items.some(item => item.id === id)) {
    showFeedback('错误：该 Item ID 已存在！', 'error');
    return;
  }
  if (items.some(item => item.name === name)) {
    showFeedback('错误：该商品名称已存在！', 'error');
    return;
  }

  const newItem: Item = {
    id, name, category, quantity, price, supplier, stockStatus, popular,
    comment: comment || undefined
  };
  items.push(newItem);
  showFeedback(`商品 "${name}" 添加成功！`, 'success');
  clearForm();
  renderTable();
}

function deleteItem(name: string): void {
  if (confirm(`确定要删除商品 "${name}" 吗？`)) {
    const index = items.findIndex(item => item.name === name);
    if (index !== -1) {
      items.splice(index, 1);
      showFeedback(`商品 "${name}" 已删除！`, 'success');
      renderTable();
    } else {
      showFeedback(`错误：未找到商品 "${name}"`, 'error');
    }
  }
}

function editItem(name: string): void {
  const item = items.find(i => i.name === name);
  if (!item) {
    showFeedback(`错误：未找到商品 "${name}"`, 'error');
    return;
  }

  // 记录原名称
  currentEditOriginalName = item.name;

  (document.getElementById('itemId') as HTMLInputElement).value = item.id;
  (document.getElementById('itemName') as HTMLInputElement).value = item.name;
  (document.getElementById('category') as HTMLSelectElement).value = item.category;
  (document.getElementById('quantity') as HTMLInputElement).value = item.quantity.toString();
  (document.getElementById('price') as HTMLInputElement).value = item.price.toString();
  (document.getElementById('supplier') as HTMLInputElement).value = item.supplier;
  (document.getElementById('stockStatus') as HTMLSelectElement).value = item.stockStatus;
  (document.getElementById('popular') as HTMLInputElement).checked = item.popular;
  (document.getElementById('comment') as HTMLTextAreaElement).value = item.comment || '';
}

function searchItem(): void {
  const keyword = (document.getElementById('searchInput') as HTMLInputElement).value.toLowerCase().trim();
  if (!keyword) {
    showFeedback('请输入搜索关键词', 'error');
    return;
  }
  const filtered = items.filter(item => item.name.toLowerCase().includes(keyword));
  if (filtered.length === 0) {
    showFeedback(`未找到包含 "${keyword}" 的商品`, 'error');
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
    showFeedback('当前没有 Popular Items', 'error');
    return;
  }
  renderTable(popularItems);
}

window.onload = function (): void {
  populateCategorySelect();
  renderTable();

  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchItem();
  });
};