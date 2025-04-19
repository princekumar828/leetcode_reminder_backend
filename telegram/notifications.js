const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;


const sendTelegramReminder = async (chatId, message) => {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    console.log(`✅ Telegram reminder sent to chat ${chatId}`);
  } catch (error) {
    console.error(`❌ Error sending Telegram reminder to ${chatId}:`, error.message);
    throw error;
  }
};

module.exports = {
  sendTelegramReminder
}; 