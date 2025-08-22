// Render Environment Diagnostic Script
// This script will help diagnose issues on Render deployment

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Render Environment Diagnostic');
console.log('================================');

// 1. Check Environment Variables
console.log('\n1. Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configured' : 'Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Configured' : 'Missing');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'Configured' : 'Missing');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'undefined');

// 2. Test MongoDB Connection
console.log('\n2. Testing MongoDB Connection...');
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connection successful');
      
      // Test basic operations
      return mongoose.connection.db.admin().ping();
    })
    .then(() => {
      console.log('✅ MongoDB ping successful');
      
      // List collections
      return mongoose.connection.db.listCollections().toArray();
    })
    .then((collections) => {
      console.log('📊 Available collections:', collections.map(c => c.name));
      
      // Close connection
      return mongoose.connection.close();
    })
    .then(() => {
      console.log('✅ MongoDB connection closed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ MongoDB error:', error.message);
      process.exit(1);
    });
} else {
  console.error('❌ MONGODB_URI not configured');
  process.exit(1);
}

// 3. Test API Keys
console.log('\n3. Testing API Keys...');
if (process.env.OPENAI_API_KEY) {
  const axios = require('axios');
  
  axios.get('https://api.openai.com/v1/models', {
    headers: { 
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'User-Agent': 'Auto-BPMN/1.0'
    },
    timeout: 10000
  })
  .then(() => {
    console.log('✅ OpenAI API key valid');
  })
  .catch((error) => {
    console.error('❌ OpenAI API error:', error.response?.status, error.response?.data?.error?.message || error.message);
  });
} else {
  console.log('⚠️  OpenAI API key not configured');
}

// Exit after timeout
setTimeout(() => {
  console.log('\n🎯 Diagnostic completed');
  process.exit(0);
}, 15000);
