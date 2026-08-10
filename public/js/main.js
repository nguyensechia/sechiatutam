(function () {
  const toast = document.getElementById('error-toast');

  function showError(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 4500);
  }

  async function startCheckout(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Đang tạo đơn hàng...';

    try {
      const res = await fetch('/api/payment/create', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.payUrl) {
        throw new Error(data.error || 'Không tạo được đơn hàng');
      }

      window.location.href = data.payUrl;
    } catch (err) {
      console.error(err);
      showError('Có lỗi khi kết nối MoMo, vui lòng thử lại sau ít phút.');
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  document.querySelectorAll('#cta-offer, #cta-final').forEach((btn) => {
    btn.addEventListener('click', () => startCheckout(btn));
  });
})();
