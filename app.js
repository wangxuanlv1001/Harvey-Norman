"use strict";
// PROG2005 Assessment 2 - Part 1
// Author: 吕望轩
// Date: April 2026
// Description: TypeScript-based Inventory Management System for Harvey Norman
let items = [
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
function showFeedback(message, type) {
    const feedbackDiv = document.getElementById('feedback');
    if (feedbackDiv) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
        setTimeout(() => {
            feedbackDiv.textContent = '';
            feedbackDiv.className = 'feedback';
        }, 3000);
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
}
function populateCategorySelect() {
    const categorySelect = document.getElementById('category');
    const categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}
function renderTable(filteredItems = items) {
    const tbody = document.querySelector('#inventoryTable tbody');
    if (!tbody)
        return;
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
    }
    else {
        // 新增
        const newItem = { id, name, category, quantity, price, supplier, stockStatus, popular, comment: comment || undefined };
        items.push(newItem);
        showFeedback(`商品 "${name}" 添加成功！`, 'success');
    }
    renderTable();
    clearForm();
}
function deleteItem(name) {
    if (confirm(`确定要删除 "${name}" 吗？`)) {
        items = items.filter(item => item.name !== name);
        showFeedback(`商品 "${name}" 已删除！`, 'success');
        renderTable();
    }
}
function editItem(name) {
    const item = items.find(i => i.name === name);
    if (!item)
        return;
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('category').value = item.category;
    document.getElementById('quantity').value = item.quantity.toString();
    document.getElementById('price').value = item.price.toString();
    document.getElementById('supplier').value = item.supplier;
    document.getElementById('stockStatus').value = item.stockStatus;
    document.getElementById('popular').checked = item.popular;
    document.getElementById('comment').value = item.comment || '';
}
function searchItem() {
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!keyword) {
        showFeedback('请输入搜索关键词', 'error');
        return;
    }
    const filtered = items.filter(item => item.name.toLowerCase().includes(keyword));
    renderTable(filtered);
}
function showAllItems() {
    document.getElementById('searchInput').value = '';
    renderTable(items);
}
function showPopularItems() {
    const popularItems = items.filter(item => item.popular);
    if (popularItems.length === 0) {
        showFeedback('当前没有 Popular Items', 'error');
        return;
    }
    renderTable(popularItems);
}
window.onload = function () {
    populateCategorySelect();
    renderTable();
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter')
            searchItem();
    });
};
