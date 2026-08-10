# Sổ Tay Xây Kênh Viral — Landing Page (Sẻ Chia Từ Tâm)

Landing page mobile-first bán ebook "Sổ Tay Xây Kênh Viral: Từ Số 0 Đến Tự Chủ Tài Chính" (29.000đ),
thanh toán qua MoMo, tự động giao file PDF sau khi thanh toán thành công.

## Cấu trúc

```
server.js            Express app
routes/payment.js    Tạo đơn hàng MoMo, xử lý IPN, kiểm tra trạng thái
routes/download.js   Giao file PDF (chỉ khi đơn hàng đã thanh toán)
lib/momo.js          Ký chữ ký & gọi API MoMo v2 (captureWallet)
lib/store.js         Lưu đơn hàng vào data/orders.json (file-based, đủ cho quy mô nhỏ)
public/              Landing page tĩnh (index.html, thank-you.html, css, js)
private/             File PDF gốc — KHÔNG public, chỉ tải được qua route có xác thực
```

## Chạy thử ở local

```bash
npm install
cp .env.example .env
npm start
```

Mở `http://localhost:3000`. File `.env.example` đã điền sẵn **sandbox test key công khai của MoMo**
(lấy từ tài liệu MoMo Developers) để bạn bấm nút và thấy luồng redirect sang MoMo hoạt động.
Đây KHÔNG phải tiền thật.

Lưu ý khi test local: MoMo không gọi được IPN (webhook) tới `localhost`, nên xác nhận thanh toán ở
local dựa vào bước `verify-redirect` khi MoMo chuyển hướng trình duyệt về `thank-you.html` — vẫn hoạt
động để bạn xem trọn luồng, nhưng khi lên production nên có cả IPN thật (cần domain public HTTPS).

## Trước khi bán thật — việc bạn cần tự làm

1. **Đăng ký MoMo Business** để lấy `Partner Code`, `Access Key`, `Secret Key` thật (mình không thể
   tạo tài khoản doanh nghiệp hộ bạn). Điền vào `.env` trên server production, đổi
   `MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create`.
2. Đối chiếu lại `lib/momo.js` với [tài liệu MoMo mới nhất](https://developers.momo.vn) trước khi
   nhận tiền thật — API cổng thanh toán có thể thay đổi field theo thời gian, mình viết theo tài liệu
   v2 hiện hành nhưng chưa test được end-to-end với tài khoản thật.
3. Ảnh minh hoạ ở Hero hiện là **mockup vẽ bằng SVG/CSS** (cuốn sổ + ly cà phê), không phải ảnh chụp
   thật, vì mình không có công cụ tạo ảnh trong phiên làm việc này. Nếu muốn dùng ảnh chụp thật (góc
   quán cà phê, mockup 3D), thay file trong `public/images/` và sửa `public/index.html`.
4. **File PDF thật không nằm trong Git** (repo public trên GitHub, xem `.gitignore`) — phải tự upload
   trực tiếp lên server, xem bước 5 bên dưới.

## Deploy lên Hostinger (Node.js Hosting / VPS) — domain: sechiatutam.com

1. Trong hPanel Hostinger, tạo một **Node.js App** (hoặc nếu dùng VPS, cài Node.js ≥ 18 + PM2 thủ công).
2. Trỏ `sechiatutam.com` vào app này (đã trỏ), bật SSL (Hostinger có Let's Encrypt miễn phí) — bắt
   buộc phải có HTTPS vì MoMo yêu cầu `redirectUrl`/`ipnUrl` là HTTPS.
3. Lấy code từ GitHub (repo đã push sẵn):
   ```bash
   git clone https://github.com/nguyensechia/sechiatutam.git
   cd sechiatutam
   ```
   (hoặc nếu Hostinger hỗ trợ Git deploy trong hPanel, trỏ thẳng vào repo này.)
4. Trên server, tạo file `.env` thật:
   ```bash
   cp .env.example .env
   ```
   rồi sửa: điền MoMo key thật, `MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create`, và
   `BASE_URL=https://sechiatutam.com`.
5. **Upload file PDF thật** vào `private/so-tay-xay-kenh-viral-ebook.pdf` trên server qua File
   Manager/SFTP (không có sẵn sau khi `git clone` vì bị loại trừ khỏi repo).
6. Cài dependency và khởi động:
   ```bash
   npm install --production
   npm start
   ```
   Nếu dùng VPS, nên chạy qua PM2 để tự khởi động lại khi crash:
   ```bash
   npm install -g pm2
   pm2 start server.js --name sechiatutam-landing
   pm2 save
   ```
7. Kiểm tra `https://sechiatutam.com/health` trả về `{"ok":true}`.

## GitHub

Code đã được push lên [github.com/nguyensechia/sechiatutam](https://github.com/nguyensechia/sechiatutam)
nhánh `main`. Khi sửa code thêm, commit và `git push` như bình thường để cập nhật repo.

`.gitignore` đã loại trừ `node_modules/`, `.env`, `data/orders.json`, và `private/*.pdf` — không đẩy
dữ liệu đơn hàng, khoá bí mật, hay file sản phẩm thật lên GitHub công khai.
