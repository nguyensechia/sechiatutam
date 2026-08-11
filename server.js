require('dotenv').config();
const express = require('express');
const path = require('path');

const paymentRoutes = require('./routes/payment');
const downloadRoutes = require('./routes/download');
const leadRoutes = require('./routes/lead');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/payment', paymentRoutes);
app.use('/download', downloadRoutes);
app.use('/api/lead', leadRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`So Tay Xay Kenh Viral - dang chay tai http://localhost:${PORT}`);
});
