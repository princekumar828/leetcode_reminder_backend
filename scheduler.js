var cron = require('node-cron');
const { getProblemOfDay, isProblemOfDaySolved } = require('./services/leetcodeService');
const { sendTelegramReminder } = require('./telegram/notifications');
const POTD = require('./models/potd');
const User = require('./models/users');

// Batch size for processing users
const BATCH_SIZE = 50;

// Function to fetch and store POTD at 0 UTC
const fetchAndStorePOTD = async () => {
  try {
    console.log("🔄 Fetching new POTD at UTC midnight...");
    
    // Add a small delay to ensure LeetCode has updated the POTD
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { date, title } = await getProblemOfDay();
    
    // Create new POTD entry
    const potdDate = new Date(date);
    potdDate.setUTCHours(0, 0, 0, 0);
    
    await POTD.findOneAndUpdate(
      { date: potdDate },
      { title, date: potdDate },
      { upsert: true, new: true }
    );
    
    console.log("✅ New POTD stored successfully:", title);
    
    // Run initial reminder check after POTD update
    await runReminderWindow();
  } catch (error) {
    console.error("❌ Error fetching/storing POTD:", error.message);
  }
};

// Process users in batches
const processUserBatch = async (users, now, utcHour) => {
  const promises = users.map(async (user) => {
    try {
      // Check if user was already reminded in the current UTC day
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);
      
      if (user.reminderStatus?.lastRemindedAt && 
          new Date(user.reminderStatus.lastRemindedAt).setUTCHours(0, 0, 0, 0) === todayUTC.getTime()) {
        return; // Already reminded today
      }

      const { isSolved, problemOfDay } = await isProblemOfDaySolved(user.leetcodeUsername);

      if (!isSolved) {
        const hoursLeft = 24 - utcHour;
        const message = `🔔 *LeetCode POTD Reminder*\n\n` +
                       `You haven't solved today's problem yet!\n\n` +
                       `📌 *Problem:* ${problemOfDay.title}\n` +
                       `⏳ *Time Left:* ${hoursLeft} hours until reset\n\n` +
                       `Happy coding! 💻`;

        await sendTelegramReminder(user.telegramChatId, message);

        // Update reminder status
        user.reminderStatus = {
          lastRemindedAt: now,
          lastReminderDate: todayUTC
        };
        await user.save();
      }
    } catch (err) {
      console.error(`❌ Error processing user ${user.leetcodeUsername}:`, err.message);
    }
  });

  await Promise.all(promises);
};

const runReminderWindow = async () => {
  console.log("📅 Running POTD Reminder Check...");
  const now = new Date();
  const utcHour = now.getUTCHours();
  
  // Only run during the last 10 hours before UTC midnight (14-23 UTC)
  if (utcHour < 13 || utcHour > 23) {
    console.log("⏰ Outside reminder window (13-23 UTC), skipping...");
    return;
  }

  try {
    // Get total count of users
    const totalUsers = await User.countDocuments({ "reminders.potd": true });
    console.log(`📊 Processing ${totalUsers} users...`);

    // Process users in batches
    for (let skip = 0; skip < totalUsers; skip += BATCH_SIZE) {
      const users = await User.find({ "reminders.potd": true })
        .skip(skip)
        .limit(BATCH_SIZE);
      
      await processUserBatch(users, now, utcHour);
      
      // Add a small delay between batches to prevent overwhelming the system
      if (skip + BATCH_SIZE < totalUsers) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log("✅ Reminder cycle complete.");
  } catch (error) {
    console.error("❌ Error in reminder window:", error.message);
  }
};

// Fetch POTD at 00:01 UTC every day (1 minute after midnight to ensure LeetCode has updated)
cron.schedule("1 0 * * *", fetchAndStorePOTD,{
  scheduled: true,
  timezone: "UTC"
});

cron.schedule("0 13-23 * * *", async () => {
  try {
    await runReminderWindow();
  } catch (error) {
    console.error("❌ Error in scheduled reminder:", error.message);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});


cron.schedule("* * * * *", async () => {
  try {
    await runReminderWindow();
  } catch (error) {
    console.error("❌ Error in scheduled reminder:", error.message);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

