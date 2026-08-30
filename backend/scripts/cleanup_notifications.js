require('dotenv').config();
const { connectToServer, getDb, closeConnection } = require('../config/db.js');

async function run() {
  console.log("Connecting to database...");
  try {
    await connectToServer();
    const db = getDb();

    // Find all processed leaves (Approved or Rejected)
    const processedLeaves = await db.collection('leaves')
      .find({ status: { $in: ['Approved', 'Rejected'] } })
      .toArray();

    console.log(`Found ${processedLeaves.length} processed leaves.`);
    let markedRead = 0;

    for (const leave of processedLeaves) {
      const datePart = leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '';
      const textToSearch = `New ${leave.type} request from ${leave.name} starting ${datePart}`;

      // Mark matching notifications as read
      const result = await db.collection('notifications').updateMany(
        {
          $or: [
            { referenceId: leave._id.toString() },
            { text: textToSearch },
            { text: { $regex: new RegExp(leave.name, 'i') }, type: "Leave" }
          ]
        },
        { $set: { read: true } }
      );

      markedRead += result.modifiedCount;
    }

    console.log(`Cleaned up notifications. Marked ${markedRead} notifications as read.`);
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    await closeConnection();
  }
}

run();
