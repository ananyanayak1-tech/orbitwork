const { connectToServer, getDb, closeConnection } = require('../config/db');

const migrateProjectIds = async () => {
  try {
    console.log("Connecting to database...");
    const db = await connectToServer();
    
    console.log("Fetching all projects...");
    // Find all projects and sort by _id to preserve creation/insert order
    const projects = await db.collection('projects').find().sort({ _id: 1 }).toArray();
    console.log(`Found ${projects.length} projects.`);

    let index = 1;
    for (const proj of projects) {
      const customId = 'P' + String(index).padStart(2, '0');
      console.log(`Migrating project: "${proj.name}" (Current ID: ${proj.id}) -> (New ID: ${customId})`);
      
      await db.collection('projects').updateOne(
        { _id: proj._id },
        { $set: { id: customId } }
      );
      index++;
    }

    console.log("Project IDs migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await closeConnection();
    process.exit(0);
  }
};

migrateProjectIds();
