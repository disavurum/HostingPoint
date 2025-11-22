require('dotenv').config();
const User = require('./models/User');
const Forum = require('./models/Forum');
const DeployService = require('./services/DeployService');

// Force localhost domain for testing
const DOMAIN = 'localhost';
const TEST_EMAIL = 'ardaomer59@gmail.com';
const TEST_PASSWORD = 'TempPassword123!'; // Temporary password, user should change it

// Generate random subdomain
function generateRandomSubdomain() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'test-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createTestForum() {
  try {
    console.log('Initializing database...');
    await User.init();
    await Forum.init();

    // Check if user exists, if not create one
    let user = await User.findByEmail(TEST_EMAIL);
    let userId;
    if (!user) {
      console.log(`User ${TEST_EMAIL} not found, creating...`);
      const newUser = await User.create(TEST_EMAIL, TEST_PASSWORD, 'Test User');
      userId = newUser.id;
      console.log(`User created:`, newUser);
      console.log(`User ID: ${userId}`);
    } else {
      console.log(`User found:`, user);
      userId = user.id;
      console.log(`User ID: ${userId}`);
    }
    
    if (!userId) {
      throw new Error('User ID is null, cannot create forum');
    }

    // Generate random subdomain
    let forumName = generateRandomSubdomain();
    
    // Check if forum name already exists, generate new one if needed
    let existingForum = await Forum.findByName(forumName);
    let attempts = 0;
    while (existingForum && attempts < 10) {
      forumName = generateRandomSubdomain();
      existingForum = await Forum.findByName(forumName);
      attempts++;
    }

    if (existingForum) {
      throw new Error('Could not generate unique forum name after 10 attempts');
    }

    console.log(`\n=== Creating Test Forum ===`);
    console.log(`Forum Name: ${forumName}`);
    console.log(`Domain: ${DOMAIN}`);
    console.log(`Full URL: http://${forumName}.${DOMAIN}`);
    console.log(`Admin Email: ${TEST_EMAIL}`);
    console.log(`User ID: ${userId}`);
    console.log(`===========================\n`);

    // Create forum record in database
    const forumRecord = await Forum.create(forumName, userId, TEST_EMAIL, DOMAIN);
    console.log(`Forum record created with ID: ${forumRecord.id}`);

    // Deploy forum
    console.log('Starting deployment...');
    const result = await DeployService.deployForum(forumName, TEST_EMAIL, DOMAIN);
    console.log('Deployment result:', result);

    // Update forum status
    await Forum.updateStatus(forumName, 'active');
    console.log('Forum status updated to active');

    // Get the port from deployment result if available
    const forumUrl = DOMAIN === 'localhost' 
      ? `http://localhost:${result.port || '3001'}` 
      : `https://${forumName}.${DOMAIN}`;
    
    console.log('\n=== FORUM CREATED SUCCESSFULLY ===');
    console.log(`Forum Name: ${forumName}`);
    console.log(`Forum URL: ${forumUrl}`);
    console.log(`Admin Email: ${TEST_EMAIL}`);
    console.log(`User ID: ${userId}`);
    if (DOMAIN === 'localhost') {
      console.log('\n=== IMPORTANT FOR LOCALHOST ===');
      console.log('Forum is accessible at:');
      console.log(`  http://localhost:${result.port || '3001'}`);
      console.log('\nTo use subdomain, add this to your hosts file:');
      console.log(`  127.0.0.1  ${forumName}.localhost`);
      console.log('Windows: C:\\Windows\\System32\\drivers\\etc\\hosts');
      console.log('Linux/Mac: /etc/hosts');
      console.log('Then access at: http://' + forumName + '.localhost');
    }
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test forum:', error);
    process.exit(1);
  }
}

createTestForum();

