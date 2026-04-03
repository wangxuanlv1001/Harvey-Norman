// PROG2005 Assessment 2 - Part 1
// Author: 吕望轩
// Date: April 2026
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
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${item.supplier}</td>
      <td>${item.stockStatus}</td>
      <td>${item.popular ? 'Yes' : 'No'}</td>
      <td>${item.comment || '-'}</td>
      <td>
        <button class="btn-edit" onclick="editItem('${item.name.replace(/'/g, "\\'")}')">编辑</button>
        <button class="btn-delete" onclick="deleteItem('${item.name.replace(/'/g, "\\'")}')">删除</button>
      </td>
    `;
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

  const existingByName = items.find(item => item.name === name);
  const existingById = items.find(item => item.id === id);

  if (existingById && (!existingByName || existingByName.id !== id)) {
    showFeedback('错误：该 Item ID 已存在！', 'error');
    return;
  }

  if (existingByName) {
    // 更新
    existingByName.id = id;
    existingByName.category = category;
    existingByName.quantity = quantity;
    existingByName.price = price;
    existingByName.supplier = supplier;
    existingByName.stockStatus = stockStatus;
    existingByName.popular = popular;
    existingByName.comment = comment || undefined;
    showFeedback(`商品 "${name}" 更新成功！`, 'success');
  } else {
    // 新增
    const newItem: Item = { id, name, category, quantity, price, supplier, stockStatus, popular, comment: comment || undefined };
    items.push(newItem);
    showFeedback(`商品 "${name}" 添加成功！`, 'success');
  }

  renderTable();
  clearForm();
}

function deleteItem(name: string): void {
  if (confirm(`确定要删除 "${name}" 吗？`)) {
    items = items.filter(item => item.name !== name);
    showFeedback(`商品 "${name}" 已删除！`, 'success');
    renderTable();
  }
}

function editItem(name: string): void {
  const item = items.find(i => i.name === name);
  if (!item) return;

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