const { connectToServer, getDb, closeConnection } = require('../config/db');

const migrateDeptIds = async () => {
  try {
    console.log("Connecting to database...");
    const db = await connectToServer();
    
    console.log("Fetching all departments...");
    // Find all departments and sort by _id to preserve creation/insert order
    const departments = await db.collection('departments').find().sort({ _id: 1 }).toArray();
    console.log(`Found ${departments.length} departments.`);

    let index = 1;
    for (const dept of departments) {
      const customId = 'D' + String(index).padStart(2, '0');
      console.log(`Migrating department: "${dept.name}" (Current ID: ${dept.id}) -> (New ID: ${customId})`);
      
      await db.collection('departments').updateOne(
        { _id: dept._id },
        { $set: { id: customId } }
      );
      index++;
    }

    console.log("Department IDs migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await closeConnection();
    process.exit(0);
  }
};

migrateDeptIds();
