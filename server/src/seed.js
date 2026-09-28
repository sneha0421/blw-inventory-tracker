const { db } = require('./config/firebase');

const initialItems = [
  { name: 'Bearing Set (WAG-9H)', category: 'Mechanical', quantity: 45, minStock: 20, unitPrice: 850 },
  { name: 'Copper Wire Roll', category: 'Electrical', quantity: 12, minStock: 15, unitPrice: 1200 },
  { name: 'Safety Helmet', category: 'Safety Gear', quantity: 80, minStock: 30, unitPrice: 250 },
  { name: 'Hydraulic Oil (5L)', category: 'Consumables', quantity: 8, minStock: 10, unitPrice: 950 },
  { name: 'Wrench Set', category: 'Tools', quantity: 25, minStock: 10, unitPrice: 600 },
  { name: 'Circuit Breaker', category: 'Electrical', quantity: 18, minStock: 20, unitPrice: 2100 },
  { name: 'Welding Rod (Pack)', category: 'Consumables', quantity: 60, minStock: 25, unitPrice: 340 },
  { name: 'Steel Rivets (Box)', category: 'Mechanical', quantity: 5, minStock: 15, unitPrice: 180 },
  { name: 'Insulation Tape', category: 'Electrical', quantity: 100, minStock: 40, unitPrice: 45 },
  { name: 'Torque Wrench', category: 'Tools', quantity: 7, minStock: 5, unitPrice: 1800 }
];

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding process...');

  try {
    // Clear existing items in collection if any
    const existingSnapshot = await db.collection('items').get();
    if (!existingSnapshot.empty) {
      console.log(`Clearing ${existingSnapshot.docs.length} existing items...`);
      for (const doc of existingSnapshot.docs) {
        await db.collection('items').doc(doc.id).delete();
      }
    }

    const now = new Date().toISOString();
    console.log('Inserting seed sample items...');
    for (const item of initialItems) {
      const docData = {
        ...item,
        lastUpdated: now
      };
      const docRef = await db.collection('items').add(docData);
      console.log(`  ✓ Inserted: ${item.name} (${item.category}) - ID: ${docRef.id}`);
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
