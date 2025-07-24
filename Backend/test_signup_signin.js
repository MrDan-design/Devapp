// Test script for signup and signin endpoints
// --- Added by user request on July 24, 2025 ---
const axios = require('axios');

const API_BASE = 'http://localhost:4000/api/users';

async function testSignupAndSignin() {
  const testUser = {
    fullname: 'Test User',
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    country: 'Testland',
    currency: 'USD',
    nextOfKin: 'Kin Name',
    nextOfKinNumber: '1234567890'
  };

  // 1. Signup
  try {
    const signupRes = await axios.post(`${API_BASE}/signup`, testUser);
    console.log('Signup response:', signupRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Signup error:', err.response.data);
    } else {
      console.error('Signup error:', err.message);
    }
  }

  // 2. Signin
  try {
    const signinRes = await axios.post(`${API_BASE}/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Signin response:', signinRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Signin error:', err.response.data);
    } else {
      console.error('Signin error:', err.message);
    }
  }
}

testSignupAndSignin();
