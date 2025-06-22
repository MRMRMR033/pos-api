// Test script for Phase 1 authentication flow
// Using native Node.js fetch (available in Node 18+)

const BASE_URL = 'http://localhost:3000';
const ADMIN_CREDENTIALS = {
  email: 'admin@pos-system.com',
  password: '12345'
};

async function testAuthFlow() {
  console.log('🧪 Testing Phase 1 Authentication Flow\n');

  try {
    // 1. Test Login
    console.log('1️⃣ Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   - Access Token: ${loginData.access_token ? 'Generated' : 'Missing'}`);
    console.log(`   - Refresh Token: ${loginData.refresh_token ? 'Generated' : 'Missing'}`);
    console.log(`   - Expires In: ${loginData.expires_in} seconds\n`);

    // 2. Test Access Token with Profile
    console.log('2️⃣ Testing Access Token...');
    const profileResponse = await fetch(`${BASE_URL}/auth/perfil`, {
      headers: { 'Authorization': `Bearer ${loginData.access_token}` }
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile access failed: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Access token works');
    console.log(`   - User: ${profileData.fullName} (${profileData.email})\n`);

    // 3. Test Refresh Token
    console.log('3️⃣ Testing Refresh Token...');
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: loginData.refresh_token })
    });

    if (!refreshResponse.ok) {
      throw new Error(`Token refresh failed: ${refreshResponse.status}`);
    }

    const refreshData = await refreshResponse.json();
    console.log('✅ Token refresh successful');
    console.log(`   - New Access Token: ${refreshData.access_token ? 'Generated' : 'Missing'}`);
    console.log(`   - New Refresh Token: ${refreshData.refresh_token ? 'Generated' : 'Missing'}`);
    console.log(`   - Token Rotation: ${refreshData.refresh_token !== loginData.refresh_token ? 'Working' : 'Failed'}\n`);

    // 4. Test Logout
    console.log('4️⃣ Testing Logout...');
    const logoutResponse = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshData.refresh_token })
    });

    if (!logoutResponse.ok) {
      throw new Error(`Logout failed: ${logoutResponse.status}`);
    }

    console.log('✅ Logout successful\n');

    // 5. Test that refresh token is invalidated
    console.log('5️⃣ Testing Session Invalidation...');
    const invalidRefreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshData.refresh_token })
    });

    if (invalidRefreshResponse.ok) {
      throw new Error('Session should be invalidated after logout');
    }

    console.log('✅ Session properly invalidated after logout\n');

    console.log('🎉 ALL TESTS PASSED - Phase 1 Authentication Flow Working Correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuthFlow();