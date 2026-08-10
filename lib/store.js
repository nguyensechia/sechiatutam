// File-based order store. Du cho landing page mot san pham, luu luong thap.
// Neu can scale (nhieu san pham, nhieu don/giay), thay bang SQLite/Postgres.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'orders.json');

function readAll() {
  if (!fs.existsSync(DB_PATH)) return {};
  const raw = fs.readFileSync(DB_PATH, 'utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeAll(orders) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2), 'utf8');
}

function createOrder(order) {
  const orders = readAll();
  orders[order.orderId] = order;
  writeAll(orders);
  return order;
}

function getOrder(orderId) {
  const orders = readAll();
  return orders[orderId] || null;
}

function updateOrder(orderId, patch) {
  const orders = readAll();
  if (!orders[orderId]) return null;
  orders[orderId] = { ...orders[orderId], ...patch };
  writeAll(orders);
  return orders[orderId];
}

module.exports = { createOrder, getOrder, updateOrder };
