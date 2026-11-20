/**
 * Telegram Bot API orqali buyurtmalarni kanalga avtomatik yuborish moduli
 */

const TELEGRAM_BOT_TOKEN = "9137724398:AAGnAQQKw7vqsTZYMJkhOb6u7bH9Wfv9mm8";
const TELEGRAM_CHANNEL_ID = "-1003823343684";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPrice(amount) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
}

export async function sendOrderToTelegram(order) {
  const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const itemsText = order.items
    .map((item, idx) => {
      const subtotal = item.unitPrice * item.quantity;
      return [
        `${idx + 1}. <b>${escapeHtml(item.name)}</b>`,
        `   Rang: ${escapeHtml(item.colorName)} | Xotira: ${escapeHtml(item.storage)}`,
        `   Soni: ${item.quantity} dona × ${formatPrice(item.unitPrice)} = <b>${formatPrice(subtotal)}</b>`,
      ].join("\n");
    })
    .join("\n\n");

  const noteLine = order.customer.note
    ? `\n📝 <b>Izoh:</b> ${escapeHtml(order.customer.note)}`
    : "";

  const messageHtml = [
    `🛒 <b>YANGI BUYURTMA #${escapeHtml(order.orderId)}</b>`,
    `🕒 <b>Vaqt:</b> ${escapeHtml(order.createdAt)}`,
    ``,
    `👤 <b>Mijoz:</b> ${escapeHtml(order.customer.name)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(order.customer.phone)}`,
    `📍 <b>Hudud:</b> ${escapeHtml(order.customer.region)}`,
    `🏠 <b>Manzil:</b> ${escapeHtml(order.customer.address)}`,
    `💳 <b>To'lov turi:</b> ${escapeHtml(order.customer.paymentMethod)}${noteLine}`,
    ``,
    `📱 <b>Buyurtma tarkibi:</b>`,
    itemsText,
    ``,
    `💰 <b>Jami summa:</b> <code>${formatPrice(order.totalAmount)}</code>`,
    `🚚 <b>Yetkazib berish:</b> Bepul`,
  ].join("\n");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHANNEL_ID,
      text: messageHtml,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Telegram serveridan noto'g'ri javob qaytdi.");
  }

  if (!response.ok || !data.ok) {
    const desc = data?.description || "Telegram xabarini yuborib bo'lmadi.";
    throw new Error(desc);
  }

  return data;
}
