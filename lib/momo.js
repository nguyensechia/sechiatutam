// MoMo Payment Gateway helper - AIO v2 "captureWallet" flow.
// Tai lieu chinh thuc: https://developers.momo.vn/v3/docs/payment/api/wallet/onetime
// QUAN TRONG: doi chieu lai voi tai lieu MoMo hien hanh truoc khi len production,
// vi cong thanh toan co the thay doi field/endpoint theo thoi gian.

const crypto = require('crypto');
const fetch = require('node-fetch');
const { nanoid } = require('nanoid');

function sign(rawSignature, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
}

async function createPayment({ orderId, amount, orderInfo }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT;
  const baseUrl = process.env.BASE_URL;

  const requestId = nanoid();
  const redirectUrl = `${baseUrl}/thank-you.html?orderId=${orderId}`;
  const ipnUrl = `${baseUrl}/api/payment/momo-ipn`;
  const requestType = 'captureWallet';
  const extraData = '';

  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}&requestType=${requestType}`;

  const signature = sign(rawSignature, secretKey);

  const body = {
    partnerCode,
    partnerName: 'Se Chia Tu Tam',
    storeId: 'SeChiaTuTam',
    requestId,
    amount: String(amount),
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    extraData,
    requestType,
    signature,
    autoCapture: true,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data; // { payUrl, resultCode, message, ... }
}

// Xac minh chu ky cua goi tin IPN MoMo gui ve, tranh gia mao ket qua thanh toan.
function verifyIpnSignature(payload) {
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const {
    amount, extraData, message, orderId, orderInfo, orderType,
    partnerCode, payType, requestId, responseTime, resultCode,
    transId, signature,
  } = payload;

  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
    `&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}` +
    `&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const expected = sign(rawSignature, secretKey);
  return expected === signature;
}

module.exports = { createPayment, verifyIpnSignature };
