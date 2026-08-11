// Gui email bao khach hang xac nhan chuyen khoan, dung Gmail SMTP.
// Can GMAIL_USER + GMAIL_APP_PASSWORD trong .env (App Password 16 ky tu,
// tao trong Google Account > Bao mat > Mat khau ung dung - can bat 2FA truoc).

const nodemailer = require('nodemailer');

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendLeadNotification({ name, phone }) {
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !to) {
    throw new Error('Chua cau hinh GMAIL_USER / GMAIL_APP_PASSWORD / LEAD_NOTIFY_EMAIL trong .env');
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Sổ Tay Xây Kênh Viral" <${process.env.GMAIL_USER}>`,
    to,
    subject: `[Đơn mới] ${name} vừa xác nhận chuyển khoản 39.000đ`,
    text: [
      `Có khách vừa bấm "Đã chuyển khoản" trên landing page.`,
      ``,
      `Tên: ${name}`,
      `SĐT/Zalo: ${phone}`,
      ``,
      `Kiểm tra tài khoản ngân hàng/MoMo, đối chiếu nội dung chuyển khoản "${name} ${phone}",`,
      `rồi gửi file Sổ Tay qua Zalo cho khách nhé.`,
    ].join('\n'),
  });
}

module.exports = { sendLeadNotification };
