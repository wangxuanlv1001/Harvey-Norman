"use strict";
let items = [
  { id: "ITEM001", name: "Samsung 55 Inch OLED TV", category: "Electronics", quantity: 12, price: 1299.99, supplier: "Samsung Australia", stockStatus: "In Stock", popular: true, comment: "Best selling TV this month" },
  { id: "ITEM002", name: "Office Executive Chair", category: "Furniture", quantity: 8, price: 349.50, supplier: "Herman Miller", stockStatus: "Low Stock", popular: false },
  { id: "ITEM003", name: "Leather Jacket", category: "Clothing", quantity: 25, price: 189.99, supplier: "Levi's", stockStatus: "In Stock", popular: true, comment: "Popular winter item" }
];

let currentEditOriginalName = null;

function showFeedback(message, type) {
  const fb = document.getElementById('feedback');
  if (fb) {
    fb.textContent = message;
    fb.className = `feedback ${type}`;
    setTimeout(() => { fb.textContent = ''; fb.className = 'feedback'; }, 3000);
  }
}

function clearForm() {
  document.getElementById('itemId').value = '';
  document.getElementById('itemName').value = '';
  document.getElementById('category').value = 'Electronics';
  document.getElementById('quantity').value = '';
  document.getElementById('price').value = '';
  document.getElementById('supplier').value = '';
  document.getElementById('stockStatus').value = 'In Stock';
  document.getElementById('popular').checked = false;
  document.getElementById('comment').value = '';
  const idInput = document.getElementById('itemId');
  idInput.removeAttribute('readonly');
  currentEditOriginalName = null;
  const searchEditInput = document.getElementById('searchEditName');
  if (searchEditInput) searchEditInput.value = '';
  // 重置所有删除确认状态
  document.querySelectorAll('.delete-confirm-buttons').forEach(el => el.remove());
  document.querySelectorAll('.btn-delete-original').forEach(btn => btn.style.display = 'inline-block');
}

function populateCategorySelect() {
  const select = document.getElementById('category');
  const cats = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  cats.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; select.appendChild(opt); });
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// 显示内联确认按钮（替换原Delete按钮）
function showDeleteConfirm(btnElement, name) {
  // 隐藏原来的 Delete 按钮
  btnElement.style.display = 'none';
  // 创建确认按钮容器
  const container = document.createElement('span');
  container.className = 'delete-confirm-buttons';
  container.innerHTML = `
    <button class="confirm-yes" onclick="confirmDeleteFromButton('${escapeHtml(name).replace(/'/g, "\\'")}', this)">Yes</button>
    <button class="confirm-no" onclick="cancelDeleteFromButton(this)">No</button>
  `;
  btnElement.parentNode.insertBefore(container, btnElement.nextSibling);
}

// 确认删除
function confirmDeleteFromButton(name, yesBtn) {
  const index = items.findIndex(i => i.name === name);
  if (index !== -1) {
    items.splice(index, 1);
    showFeedback(`Product "${name}" deleted successfully!`, 'success');
    renderTable();
  } else {
    showFeedback(`Error: Product "${name}" not found.`, 'error');
    // 如果删除失败，恢复按钮
    cancelDeleteFromButton(yesBtn);
  }
}

// 取消删除，恢复原来的 Delete 按钮
function cancelDeleteFromButton(noBtn) {
  const container = noBtn.closest('.delete-confirm-buttons');
  if (container) {
    const originalDeleteBtn = container.previousSibling;
    if (originalDeleteBtn && originalDeleteBtn.classList && originalDeleteBtn.classList.contains('btn-delete-original')) {
      originalDeleteBtn.style.display = 'inline-block';
    }
    container.remove();
  }
}

function loadForEdit() {
  const name = document.getElementById('searchEditName').value.trim();
  if (!name) { showFeedback('Please enter a product name to edit.', 'error'); return; }
  const item = items.find(i => i.name === name);
  if (!item) { showFeedback(`Product "${name}" not found.`, 'error'); return; }
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('category').value = item.category;
  document.getElementById('quantity').value = item.quantity;
  document.getElementById('price').value = item.price;
  document.getElementById('supplier').value = item.supplier;
  document.getElementById('stockStatus').value = item.stockStatus;
  document.getElementById('popular').checked = item.popular;
  document.getElementById('comment').value = item.comment || '';
  const idInput = document.getElementById('itemId');
  idInput.setAttribute('readonly', 'readonly');
  currentEditOriginalName = item.name;
  showFeedback(`Loaded "${item.name}" for editing. ID is now readonly.`, 'success');
}

function addOrUpdateItem() {
  const id = document.getElementById('itemId').value.trim();
  const name = document.getElementById('itemName').value.trim();
  const category = document.getElementById('category').value;
  const quantity = parseFloat(document.getElementById('quantity').value);
  const price = parseFloat(document.getElementById('price').value);
  const supplier = document.getElementById('supplier').value.trim();
  const stockStatus = document.getElementById('stockStatus').value;
  const popular = document.getElementById('popular').checked;
  const comment = document.getElementById('comment').value.trim();

  if (!id || !name || !supplier) { showFeedback('Error: ID, Name, and Supplier are required!', 'error'); return; }
  if (isNaN(quantity) || quantity < 0) { showFeedback('Quantity must be >= 0', 'error'); return; }
  if (isNaN(price) || price <= 0) { showFeedback('Price must be > 0', 'error'); return; }

  if (currentEditOriginalName !== null) {
    const existing = items.find(i => i.name === currentEditOriginalName);
    if (!existing) { showFeedback('Product to edit no longer exists.', 'error'); clearForm(); renderTable(); return; }
    if (existing.id !== id && items.some(i => i.id === id && i.name !== currentEditOriginalName)) { showFeedback('Item ID already used by another product.', 'error'); return; }
    if (existing.name !== name && items.some(i => i.name === name && i.name !== currentEditOriginalName)) { showFeedback('Product name already used.', 'error'); return; }
    existing.id = id; existing.name = name; existing.category = category; existing.quantity = quantity; existing.price = price;
    existing.supplier = supplier; existing.stockStatus = stockStatus; existing.popular = popular; existing.comment = comment || undefined;
    showFeedback(`Product "${name}" updated!`, 'success');
    clearForm(); renderTable();
    return;
  }

  if (items.some(i => i.id === id)) { showFeedback('Item ID already exists!', 'error'); return; }
  if (items.some(i => i.name === name)) { showFeedback('Product name already exists!', 'error'); return; }
  items.push({ id, name, category, quantity, price, supplier, stockStatus, popular, comment: comment || undefined });
  showFeedback(`Product "${name}" added!`, 'success');
  clearForm(); renderTable();
}

function renderTable(filtered = items) {
  const tbody = document.querySelector('#inventoryTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  filtered.forEach(item => {
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
        <button class="btn-edit" onclick="editItem('${escapeHtml(item.name).replace(/'/g, "\\'")}')">Edit</button>
        <button class="btn-delete-original" onclick="showDeleteConfirm(this, '${escapeHtml(item.name).replace(/'/g, "\\'")}')">Delete</button>
      </td>
    `;
  });
}

function editItem(name) {
  document.getElementById('searchEditName').value = name;
  loadForEdit();
}

function searchItem() {
  const kw = document.getElementById('searchInput').value.toLowerCase().trim();
  if (!kw) { showFeedback('Enter keyword', 'error'); return; }
  const filtered = items.filter(i => i.name.toLowerCase().includes(kw));
  if (!filtered.length) showFeedback(`No results for "${kw}"`, 'error');
  renderTable(filtered);
}

function showAllItems() { document.getElementById('searchInput').value = ''; renderTable(); }
function showPopularItems() {
  const popular = items.filter(i => i.popular);
  if (!popular.length) showFeedback('No popular items', 'error');
  renderTable(popular);
}

window.onload = () => {
  populateCategorySelect();
  renderTable();
  document.getElementById('searchInput').addEventListener('keypress', e => { if (e.key === 'Enter') searchItem(); });
  document.getElementById('loadEditBtn').addEventListener('click', loadForEdit);
  document.querySelector('.btn-secondary').addEventListener('click', clearForm);
};