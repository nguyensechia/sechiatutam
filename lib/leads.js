// Luu lai danh sach khach da bam "Da chuyen khoan", phong khi gui email
// that bai thi van co noi de chu shop tu kiem tra lai.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'leads.json');

function appendLead({ name, phone }) {
  let leads = [];
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf8').trim();
    if (raw) {
      try { leads = JSON.parse(raw); } catch { leads = []; }
    }
  }
  leads.push({ name, phone, createdAt: new Date().toISOString() });
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(leads, null, 2), 'utf8');
}

module.exports = { appendLead };
