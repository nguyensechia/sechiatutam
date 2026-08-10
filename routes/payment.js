const express = require('express');
const { nanoid } = require('nanoid');
const { createPayment, verifyIpnSignature } = require('../lib/momo');
const store = require('../lib/store');

const router = express.Router();

// Tao don hang + goi MoMo de lay link thanh toan
router.post('/create', async (req, res) => {
  try {
    const orderId = `SCTT${Date.now()}${nanoid(5)}`;
    const amount = Number(process.env.PRODUCT_PRICE || 29000);
    const orderInfo = process.env.PRODUCT_NAME || 'So Tay Xay Kenh Viral';
    const downloadToken = nanoid(24);

    store.createOrder({
      orderId,
      amount,
      status: 'pending',
      downloadToken,
      createdAt: new Date().toISOString(),
    });

    const momoRes = await createPayment({ orderId, amount, orderInfo });

    if (momoRes.resultCode !== 0 || !momoRes.payUrl) {
      store.updateOrder(orderId, { status: 'failed', momoError: momoRes });
      return res.status(502).json({
        error: 'Khong tao duoc lien ket thanh toan MoMo',
        detail: momoRes.message || momoRes,
      });
    }

    store.updateOrder(orderId, { momoRequestId: momoRes.requestId });
    res.json({ orderId, payUrl: momoRes.payUrl });
  } catch (err) {
    console.error('Loi tao don hang MoMo:', err);
    res.status(500).json({ error: 'Loi server khi tao don hang' });
  }
});

// MoMo goi ngam (server-to-server) de bao ket qua thanh toan - nguon xac nhan dang tin cay nhat
router.post('/momo-ipn', (req, res) => {
  try {
    const payload = req.body;
    if (!verifyIpnSignature(payload)) {
      console.warn('IPN MoMo: chu ky khong hop le', payload);
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { orderId, resultCode, transId } = payload;
    if (String(resultCode) === '0') {
      store.updateOrder(orderId, { status: 'paid', transId, paidAt: new Date().toISOString() });
    } else {
      store.updateOrder(orderId, { status: 'failed', momoResult: payload });
    }

    res.status(204).end();
  } catch (err) {
    console.error('Loi xu ly IPN MoMo:', err);
    res.status(500).end();
  }
});

// Trang thank-you goi API nay khi vua duoc MoMo redirect ve, de xac nhan ngay
// (khong doi IPN, hop ly khi test local vi MoMo khong goi duoc IPN toi localhost)
router.get('/verify-redirect', (req, res) => {
  try {
    const payload = req.query;
    if (!payload.orderId || !payload.signature) {
      return res.status(400).json({ error: 'Thieu tham so' });
    }
    if (!verifyIpnSignature(payload)) {
      return res.status(400).json({ error: 'Chu ky khong hop le' });
    }

    const { orderId, resultCode, transId } = payload;
    if (String(resultCode) === '0') {
      store.updateOrder(orderId, { status: 'paid', transId, paidAt: new Date().toISOString() });
    }
    const order = store.getOrder(orderId);
    res.json({ status: order?.status || 'unknown' });
  } catch (err) {
    console.error('Loi verify-redirect:', err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// Frontend poll trang thai don hang (vd sau khi IPN ve ngam)
router.get('/status/:orderId', (req, res) => {
  const order = store.getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Khong tim thay don hang' });
  res.json({
    status: order.status,
    downloadToken: order.status === 'paid' ? order.downloadToken : undefined,
  });
});

module.exports = router;
