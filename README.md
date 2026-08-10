# Sổ Tay Xây Kênh Viral — Landing Page (Sẻ Chia Từ Tâm)

Landing page mobile-first bán ebook "Sổ Tay Xây Kênh Viral: Từ Số 0 Đến Tự Chủ Tài Chính" (39.000đ).

**Cách bán hàng hiện tại (đang dùng):** khách quét mã QR chuyển khoản Techcombank, chụp bill gửi qua
Zalo (0945 021 476), Nguyên xác nhận và gửi file PDF trực tiếp qua Zalo. Không có xử lý thanh toán tự
động — trang chỉ là một trang tĩnh (HTML/CSS), không cần backend cho luồng này.

## Cấu trúc

```
public/               Landing page (index.html, css, js, images)
public/images/        founder-photo.jpg (ảnh Nguyên) + payment-qr.png (mã QR chuyển khoản)
server.js             Express app — chỉ dùng để serve file tĩnh + (tuỳ chọn) route MoMo dưới đây
private/              File PDF gốc — KHÔNG public, chỉ dùng khi bật lại luồng MoMo tự động
```

### Mã đã viết sẵn nhưng đang KHÔNG dùng (dự phòng cho tương lai)

`routes/payment.js`, `routes/download.js`, `lib/momo.js`, `lib/store.js`, `public/thank-you.html` —
là luồng thanh toán tự động qua MoMo đã viết và test hoạt động (xem lịch sử commit), nhưng trang hiện
tại không gọi tới các route này nữa vì bạn chưa có tài khoản MoMo Business. Khi nào đăng ký được MoMo
Business, có thể bật lại bằng cách nối nút CTA trong `public/index.html` sang gọi `/api/payment/create`
như cũ (xem `git log` để tham khảo phiên bản trước).

## Chạy thử ở local

```bash
npm install
npm start
```

Mở `http://localhost:3000` — vì hiện là trang tĩnh nên chỉ cần chạy server để xem, không cần cấu hình
`.env` (file `.env.example` vẫn còn nhưng chỉ liên quan tới luồng MoMo dự phòng ở trên).

## Việc bạn cần tự làm

1. **Gửi 2 file ảnh** để mình gắn vào trang (mình không thể tự lưu ảnh bạn dán trong chat, cần bạn lưu
   file và cho biết đường dẫn, giống cách bạn gửi file PDF trước đó):
   - Ảnh chân dung của Nguyên → lưu thành `public/images/founder-photo.jpg`
   - Ảnh mã QR chuyển khoản → lưu thành `public/images/payment-qr.png`
2. **File PDF thật** — nếu muốn gửi tay qua Zalo thì không cần đưa lên server. Nếu sau này muốn tự
   động hoá, đặt file vào `private/so-tay-xay-kenh-viral-ebook.pdf` trên server (không qua git, xem
   `.gitignore`).

## Deploy lên Hostinger — domain: sechiatutam.com

1. Trong hPanel Hostinger, tạo một **Node.js App** (hoặc dùng Static/Website hosting thông thường vì
   trang hiện tại không cần backend động — chỉ cần serve file tĩnh trong `public/`).
2. Trỏ `sechiatutam.com` vào app này (đã trỏ), bật SSL (Hostinger có Let's Encrypt miễn phí).
3. Lấy code từ GitHub:
   ```bash
   git clone https://github.com/nguyensechia/sechiatutam.git
   cd sechiatutam
   ```
4. Upload 2 file ảnh vào `public/images/` nếu chưa có sẵn trong repo lúc clone.
5. Nếu deploy qua Node.js App:
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
6. Kiểm tra `https://sechiatutam.com/health` trả về `{"ok":true}`.

## GitHub

Code đã được push lên [github.com/nguyensechia/sechiatutam](https://github.com/nguyensechia/sechiatutam)
nhánh `main`. Khi sửa code thêm, commit và `git push` như bình thường để cập nhật repo.

`.gitignore` đã loại trừ `node_modules/`, `.env`, `data/orders.json`, và `private/*.pdf` — không đẩy
dữ liệu đơn hàng, khoá bí mật, hay file sản phẩm thật lên GitHub công khai.
