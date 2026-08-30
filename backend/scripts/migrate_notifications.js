require('dotenv').config();
const { connectToServer, getDb, closeConnection } = require('../config/db.js');

async function run() {
  console.log("Connecting to database...");
  try {
    await connectToServer();
    const db = getDb();

    // 1. Get HR users
    const hrUsers = await db.collection('users')
      .find({ role: 'HR' })
      .toArray();
    console.log(`Found ${hrUsers.length} HR users.`);

    // 2. Get pending leaves
    const pendingLeaves = await db.collection('leaves')
      .find({ status: 'Pending' })
      .toArray();
    console.log(`Found ${pendingLeaves.length} pending leave requests.`);

    let notificationsAdded = 0;

    for (const leave of pendingLeaves) {
      const datePart = leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '';
      const textToSearch = `New ${leave.type} request from ${leave.name} starting ${datePart}`;

      // Check if notification already exists for any HR user
      const existing = await db.collection('notifications').findOne({
        text: textToSearch
      });

      if (!existing) {
        console.log(`Backfilling notification for leave ID: ${leave._id} (${leave.name} - ${leave.type})`);
        const newNotifications = hrUsers.map(u => ({
          userId: u._id.toString(),
          type: "Leave",
          text: textToSearch,
          read: false,
          createdAt: new Date().toISOString()
        }));

        if (newNotifications.length > 0) {
          await db.collection('notifications').insertMany(newNotifications);
          notificationsAdded += newNotifications.length;
        }
      }
    }

    console.log(`Completed notification backfill. Inserted ${notificationsAdded} notifications.`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await closeConnection();
  }
}

run();
