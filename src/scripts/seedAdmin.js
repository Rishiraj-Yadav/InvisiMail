// scripts/seedAdmin.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
// require('dotenv').config({ path: '.env.local' })
MONGODB_URI= process.env.MONGODB_URI

async function seedAdmin() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Admin user details
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456'; // Change this!
    const adminName = 'GOD';
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: adminEmail 
    });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminEmail);
      
      // Update existing user to admin
      const result = await db.collection('users').updateOne(
        { email: adminEmail },
        { 
          $set: { 
            isAdmin: true,
            role: 'admin'
          } 
        }
      );
      
      console.log('✅ Updated existing user to admin');
      console.log('   Email:', adminEmail);
      console.log('   Use existing password to login');
      
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      // Create new admin user
      const result = await db.collection('users').insertOne({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        createdAt: new Date(),
        plan: 'pro', // Give admin Pro plan
        subscriptionId: null,
        isAdmin: true,
        role: 'admin',
        isSuspended: false
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('   Email:', adminEmail);
      console.log('   Password:', adminPassword);
      console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
    }
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

seedAdmin();
