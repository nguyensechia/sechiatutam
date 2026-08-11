# Sổ Tay Xây Kênh Viral — Landing Page (Sẻ Chia Từ Tâm)

Landing page bán ebook "Sổ Tay Xây Kênh Viral: Từ Số 0 Đến Tự Chủ Tài Chính" (39.000đ). Thiết kế
dạng "editorial luxury" (tông plum/vàng gold, font Fraunces + Be Vietnam Pro + IBM Plex Mono),
một trang duy nhất, gồm: Hero, Câu chuyện người sáng lập, Mục lục sổ tay (kèm 2 ảnh trang mẫu thật),
Bảng giá, Cam kết hoàn tiền, FAQ, và khối đặt hàng 2 bước.

**Cách bán hàng hiện tại (đang dùng):** khách điền tên + số Zalo → quét mã QR chuyển khoản
Techcombank hoặc chuyển qua ví MoMo (0764 000 444), nội dung chuyển khoản gợi ý tự điền "[Tên] [SĐT]"
→ bấm "Đã chuyển khoản" (tự copy sẵn tin nhắn xác nhận + gửi email báo Nguyên) → khách tự mở Zalo, dán
tin nhắn, gửi cho Nguyên (0945 021 476) → Nguyên đối chiếu chuyển khoản và gửi file PDF qua Zalo.
Không có cổng thanh toán tự động (chưa có MoMo Business), nhưng có 1 route backend nhỏ (`/api/lead`)
để bắt lead + gửi email báo — xem phần Email bên dưới.

> Nút xác nhận **không tự mở tab Zalo** (không dùng `window.open`) — chỉ copy tin nhắn vào clipboard.
> Lý do: trình duyệt trong-app của TikTok từng chặn việc mở tab mới / custom URL scheme khi test luồng
> cũ, nên chuyển sang cách an toàn hơn: khách tự mở Zalo và dán tay.

## Cấu trúc

```
public/index.html      Toàn bộ trang (CSS + JS viết inline trong 1 file)
public/images/          founder-photo.jpg, payment-qr.jpg, page-preview-1.jpg, page-preview-2.jpg
server.js               Express app — serve file tĩnh + route /api/lead + (dự phòng) route MoMo
routes/lead.js           Nhận {name, phone} khi khách xác nhận đã chuyển khoản, gửi email báo
lib/mailer.js            Gửi email qua Gmail SMTP (nodemailer)
lib/leads.js             Lưu backup danh sách lead vào data/leads.json
private/                File PDF gốc (bản đầy đủ 21 trang) — KHÔNG public, KHÔNG commit lên git
```

### Mã đã viết sẵn nhưng đang KHÔNG dùng (dự phòng cho tương lai)

`routes/payment.js`, `routes/download.js`, `lib/momo.js`, `lib/store.js`, `public/thank-you.html` —
là luồng thanh toán tự động qua MoMo đã viết và test hoạt động (xem lịch sử commit), nhưng trang hiện
tại không gọi tới các route này vì chưa có tài khoản MoMo Business. Khi đăng ký được, có thể bật lại
bằng cách nối nút xác nhận trong `public/index.html` sang gọi `/api/payment/create` (xem `git log` để
tham khảo phiên bản trước có luồng này).

## Chạy thử ở local

```bash
npm install
cp .env.example .env
npm start
```

Mở `http://localhost:3000`. Nếu chưa điền `.env`, mọi thứ vẫn chạy được — chỉ riêng bước gửi email báo
đơn hàng sẽ lỗi (đã có xử lý graceful, không crash server, không chặn UI khách).

## Email báo đơn hàng mới

Khi khách bấm "Đã chuyển khoản — Gửi xác nhận", server gọi `routes/lead.js` → lưu vào
`data/leads.json` (backup, không commit lên git vì chứa thông tin khách) → gửi email tới
`LEAD_NOTIFY_EMAIL` (mặc định `phamthainguyen.qn@gmail.com`) qua Gmail SMTP.

Để bật thật, cần điền vào `.env` trên server production:
1. `GMAIL_USER` — tài khoản Gmail dùng để gửi (có thể dùng chính `phamthainguyen.qn@gmail.com`).
2. `GMAIL_APP_PASSWORD` — **không phải mật khẩu Gmail thường**. Vào Google Account → Bảo mật → bật
   "Xác minh 2 bước" (nếu chưa bật) → tạo "Mật khẩu ứng dụng" (App Password) 16 ký tự riêng cho web
   này, dán vào đây.
3. `LEAD_NOTIFY_EMAIL` — email nhận thông báo (đã đặt sẵn `phamthainguyen.qn@gmail.com`).

## File PDF sản phẩm

`private/so-tay-xay-kenh-viral-ebook.pdf` là **bản đầy đủ 21 trang** (bản cuối cùng, chính xác). File
này không nằm trong git (repo public trên GitHub) — khi deploy, giữ file trên máy bạn để đính kèm khi
nhắn Zalo, không cần đưa lên server trừ khi sau này bật lại luồng tự động qua MoMo.

## Deploy lên Hostinger — domain: sechiatutam.com

1. Trong hPanel Hostinger, tạo một **Node.js App** (hoặc dùng Static/Website hosting thông thường vì
   trang hiện tại không cần backend động — chỉ cần serve file tĩnh trong `public/`).
2. Trỏ `sechiatutam.com` vào app này (đã trỏ), bật SSL (Hostinger có Let's Encrypt miễn phí).
3. Lấy code từ GitHub:
   ```bash
   git clone https://github.com/nguyensechia/sechiatutam.git
   cd sechiatutam
   ```
4. Nếu deploy qua Node.js App:
   ```bash
   npm install --production
   npm start
   ```
   Nếu dùng VPS, nên chạy qua PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name sechiatutam-landing
   pm2 save
   ```
5. Kiểm tra `https://sechiatutam.com/health` trả về `{"ok":true}`.

## GitHub

Code đã được push lên [github.com/nguyensechia/sechiatutam](https://github.com/nguyensechia/sechiatutam)
nhánh `main`. Khi sửa code thêm, commit và `git push` như bình thường để cập nhật repo.

`.gitignore` đã loại trừ `node_modules/`, `.env`, `data/orders.json`, `data/leads.json`, và
`private/*.pdf` — không đẩy dữ liệu đơn hàng, thông tin khách, khoá bí mật, hay file sản phẩm thật lên
GitHub công khai.
