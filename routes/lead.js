const express = require('express');
const { sendLeadNotification } = require('../lib/mailer');
const { appendLead } = require('../lib/leads');

const router = express.Router();

// Khach bam "Da chuyen khoan - Gui xac nhan" tren trang -> luu lai + bao email chu shop
router.post('/', async (req, res) => {
  const name = (req.body?.name || '').toString().trim().slice(0, 200);
  const phone = (req.body?.phone || '').toString().trim().slice(0, 50);

  if (!name || !phone) {
    return res.status(400).json({ error: 'Thiếu tên hoặc số điện thoại' });
  }

  appendLead({ name, phone });

  try {
    await sendLeadNotification({ name, phone });
    res.json({ ok: true });
  } catch (err) {
    console.error('Gửi email báo đơn hàng thất bại:', err.message);
    // Da luu vao leads.json nen khong mat du lieu, chi bao loi gui mail
    res.status(502).json({ ok: false, error: 'Không gửi được email, nhưng đã lưu lại thông tin.' });
  }
});

module.exports = router;
