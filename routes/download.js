const express = require('express');
const path = require('path');
const store = require('../lib/store');

const router = express.Router();

const PDF_PATH = path.join(__dirname, '..', 'private', 'so-tay-xay-kenh-viral-ebook.pdf');
const PUBLIC_FILENAME = 'So-Tay-Xay-Kenh-Viral-SeChiaTuTam.pdf';

router.get('/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { token } = req.query;

  const order = store.getOrder(orderId);
  if (!order || order.status !== 'paid') {
    return res.status(403).send('Don hang chua duoc thanh toan hoac khong ton tai.');
  }
  if (!token || token !== order.downloadToken) {
    return res.status(403).send('Link tai khong hop le.');
  }

  res.download(PDF_PATH, PUBLIC_FILENAME);
});

module.exports = router;
