const User = require('../models/users');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const {isProblemOfDaySolved} = require('../services/leetcodeService');
const bot = new TelegramBot(token, { polling: true });

// Start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const user = await User.findOneAndUpdate(
            { telegramChatId: chatId },
            { telegramChatId: chatId },
            { upsert: true, new: true } 
        );
        
        // Reset the step for new users
        if (!user.email) {
            user.step = 'askEmail';
            await user.save();
        }
        
        const userName = msg.from.first_name || 'there';
        bot.sendMessage(chatId, `👋 Hello ${userName}! Welcome to LeetCode Reminder Bot!\n\nGet started:\n/setup - Configure your reminders\n/help - See all available commands\n/profile - View your current settings`);
    } catch (error) {
        console.error(`Error in /start command: ${error.message}`);
        bot.sendMessage(chatId, `Oops! Something went wrong. Please try again later or contact support.`);
    }
});

// Setup command
bot.onText(/\/setup/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }

    // Reset the step to begin setup process
    user.step = 'askEmail';
    await user.save();
    
    bot.sendMessage(chatId, `Let's set up your LeetCode reminder!\n\nWhat's your email address?`);
});

// Help command
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = 
`📚 LeetCode Reminder Bot Commands 📚

/start - Start the bot and create your account
/setup - Set up or reconfigure your reminders
/profile - View your current profile and settings
/help - Show this help message
/cancel - Cancel the current setup process
/contact - Contact support for assistance
/potd - Get the problem of the day status

Update Commands:
/update_email - Update your email address
/update_username - Update your LeetCode username
/update_whatsapp - Update your WhatsApp number
/update_frequency - Change your reminder frequency

Delete Commands:
/delete_account - Delete your entire account
/reset - Reset all your information

Need more help? Visit our website or contact support.`;
    
    bot.sendMessage(chatId, helpMessage);
});

// Profile command
bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    let profileMessage = 
`👤 Your LeetCode Reminder Profile 👤

`;

    if (user.email) {
        profileMessage += `📧 Email: ${user.email}\n`;
    } else {
        profileMessage += `📧 Email: Not set\n`;
    }
    
    if (user.leetcodeUsername) {
        profileMessage += `👨‍💻 LeetCode Username: ${user.leetcodeUsername}\n`;
    } else {
        profileMessage += `👨‍💻 LeetCode Username: Not set\n`;
    }
    
    if (user.whatsappNumber) {
        profileMessage += `📱 WhatsApp Number: ${user.whatsappNumber}\n`;
    } else {
        profileMessage += `📱 WhatsApp Number: Not set\n`;
    }
    
    profileMessage += `🔔 Reminder Frequency: ${user.frequency || 'Not set'}\n`;
    profileMessage += `✅ Setup Status: ${user.step === 'completed' ? 'Complete' : 'Incomplete'}\n`;
    
    if (user.lastRemindedAt) {
        const lastReminded = new Date(user.lastRemindedAt).toLocaleString();
        profileMessage += `⏰ Last Reminded: ${lastReminded}\n`;
    }
    
    profileMessage += `\nUse /setup to update your settings.`;
    
    bot.sendMessage(chatId, profileMessage);
});

// Cancel command
bot.onText(/\/cancel/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    if (user.step !== 'completed') {
        user.step = 'completed';
        await user.save();
        bot.sendMessage(chatId, `Setup process cancelled. Use /setup to start again whenever you're ready.`);
    } else {
        bot.sendMessage(chatId, `There's no active setup process to cancel.`);
    }
});

// Contact support command
bot.onText(/\/contact/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Need help? You can reach our support team at prince `);
});

// Update email command
bot.onText(/\/update_email/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    user.step = 'askEmail';
    await user.save();
    
    bot.sendMessage(chatId, `Please provide your new email address:`);
});

// Update LeetCode username command
bot.onText(/\/update_username/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    user.step = 'askLeetCodeUsername';
    await user.save();
    
    bot.sendMessage(chatId, `Please provide your new LeetCode username:`);
});

// Update WhatsApp number command
bot.onText(/\/update_whatsapp/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    user.step = 'askWhatsAppNumber';
    await user.save();
    
    bot.sendMessage(chatId, `Please provide your new WhatsApp number in international format (e.g., +1234567890):`);
});

// Update reminder frequency command
bot.onText(/\/update_frequency/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    user.step = 'askReminderFrequency';
    await user.save();
    
    // Use a keyboard for better UX
    const options = {
        reply_markup: {
            keyboard: [
                ['daily', 'weekly', 'biweekly']
            ],
            one_time_keyboard: true,
            resize_keyboard: true
        }
    };
    
    bot.sendMessage(chatId, `Please select your new reminder frequency:`, options);
});

// Reset all information command
bot.onText(/\/reset/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    // Confirm reset with inline keyboard
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Yes, reset all my data', callback_data: 'reset_confirm' },
                    { text: 'No, keep my data', callback_data: 'reset_cancel' }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, `⚠️ Are you sure you want to reset all your information? This will clear your email, LeetCode username, WhatsApp number, and reminder preferences.`, options);
});

bot.onText(/\/potd/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    if (user.step !== 'completed') {
        bot.sendMessage(chatId, `Please complete the setup process first by sending /setup`);
        return;
    }
    
    // You may want to check if user.reminders exists before accessing potd property
    if (user.reminders && user.reminders.potd) {
        const problem = await isProblemOfDaySolved(user.leetcodeUsername);
        if (problem) {
            const isSolved = problem.isSolved;
            bot.sendMessage(chatId, `The problem of the day is: ${problem.problemOfDay.title} and it is ${isSolved ? 'solved' : 'not solved'} by you.`);
        } else {
            bot.sendMessage(chatId, `No problem of the day found.`);
        }
    } else {
        bot.sendMessage(chatId, `You have not opted in for daily reminders. Use /setup to configure your reminders.`);
    }
});

// Delete account command
bot.onText(/\/delete_account/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: chatId });
    
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    // Confirm deletion with inline keyboard
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Yes, delete my account', callback_data: 'delete_confirm' },
                    { text: 'No, keep my account', callback_data: 'delete_cancel' }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, `⚠️ Are you sure you want to delete your account? All your data will be permanently removed.`, options);
});

// Handle callback queries for reset and delete confirmations
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    if (data === 'reset_confirm') {
        const user = await User.findOne({ telegramChatId: chatId });
        if (user) {
            // Reset user data but keep the account
            user.email = null;
            user.leetcodeUsername = null;
            user.whatsappNumber = null;
            user.frequency = 'daily';
            user.reminders = { potd: false, weekly: false, biweekly: false };
            user.step = 'askEmail';
            await user.save();
            
            bot.sendMessage(chatId, `✅ Your information has been reset. Use /setup to configure your account again.`);
        }
    } 
    else if (data === 'reset_cancel') {
        bot.sendMessage(chatId, `Operation cancelled. Your data remains unchanged.`);
    }
    else if (data === 'delete_confirm') {
        await User.findOneAndDelete({ telegramChatId: chatId });
        bot.sendMessage(chatId, `✅ Your account has been deleted. All your data has been removed. If you wish to use the bot again, send /start to create a new account.`);
    }
    else if (data === 'delete_cancel') {
        bot.sendMessage(chatId, `Operation cancelled. Your account remains active.`);
    }
    
    // Answer callback query to remove loading state
    bot.answerCallbackQuery(callbackQuery.id);
});

// Handle regular messages (for setup process)
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    
    // Ignore commands
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }
    
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
        bot.sendMessage(chatId, `Please start the bot first by sending /start`);
        return;
    }
    
    const text = msg.text ? msg.text.trim() : '';
    
    // Handle each step of the setup process
    if (user.step === 'askEmail') {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
            bot.sendMessage(chatId, `Invalid email address. Please provide a valid email or use /cancel to stop.`);
            return;
        }
        
        user.email = text;
        user.step = 'askLeetCodeUsername';
        await user.save();
        
        bot.sendMessage(chatId, `Great! Now, please provide your LeetCode username.`);
    } 
    else if (user.step === 'askLeetCodeUsername') {
        // Validate LeetCode username (basic validation for non-empty input)
        if (!text || text.length < 3) {
            bot.sendMessage(chatId, `Invalid LeetCode username. Username should be at least 3 characters long. Please try again or use /cancel to stop.`);
            return;
        }
        
        user.leetcodeUsername = text;
        user.step = 'askWhatsAppNumber';
        await user.save();
        
        bot.sendMessage(chatId, `Perfect! Now, please provide your WhatsApp number in international format (e.g., +1234567890).`);
    } 
    else if (user.step === 'askWhatsAppNumber') {
        // Validate WhatsApp number (E.164 format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(text)) {
            bot.sendMessage(chatId, `Invalid WhatsApp number. Please provide a valid number in international format (e.g., +1234567890) or use /cancel to stop.`);
            return;
        }
        
        user.whatsappNumber = text;
        user.step = 'askReminderFrequency';
        await user.save();
        
        // Use a keyboard for better UX for frequency selection
        const options = {
            reply_markup: {
                keyboard: [
                    ['daily', 'weekly', 'biweekly']
                ],
                one_time_keyboard: true,
                resize_keyboard: true
            }
        };
        
        bot.sendMessage(chatId, `Almost done! How often would you like to receive reminders?`, options);
    } 
    else if (user.step === 'askReminderFrequency') {
        // Validate frequency
        const validFrequencies = ['daily', 'weekly', 'biweekly'];
        const lowerText = text.toLowerCase();
        
        if (!validFrequencies.includes(lowerText)) {
            const options = {
                reply_markup: {
                    keyboard: [
                        ['daily', 'weekly', 'biweekly']
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            };
            bot.sendMessage(chatId, `Invalid frequency. Please choose from daily, weekly, or biweekly.`, options);
            return;
        }
        
        // Update reminder preferences based on frequency
        user.frequency = lowerText;
        
        // Set the appropriate reminder flag based on frequency
        if (lowerText === 'daily') {
            user.reminders.potd = true;
        } else if (lowerText === 'weekly') {
            user.reminders.weekly = true;
        } else if (lowerText === 'biweekly') {
            user.reminders.biweekly = true;
        }
        
        user.step = 'completed';
        await user.save();
        
        // Remove the keyboard
        const options = {
            reply_markup: {
                remove_keyboard: true
            }
        };
        
        bot.sendMessage(chatId, `🎉 Setup complete! You will now receive ${lowerText} LeetCode reminders.\n\nUse /profile to view your settings or /help to see all available commands.`, options);
    } 
    else if (user.step === 'completed') {
        // When setup is complete, but user sends a message
        bot.sendMessage(chatId, `Your setup is already complete. To update your information, use one of these commands:\n\n/update_email - Change your email\n/update_username - Change your LeetCode username\n/update_whatsapp - Change your WhatsApp number\n/update_frequency - Change your reminder frequency\n\nOr use /help to see all available commands.`);
    }
    else {
        // This is a fallback for any unexpected state
        bot.sendMessage(chatId, `I'm not sure what to do with that. Use /help to see available commands.`);
    }
});







// Handle any errors
bot.on('polling_error', (error) => {
  console.error(`Polling error: ${error.message}`);
});



module.exports = bot;