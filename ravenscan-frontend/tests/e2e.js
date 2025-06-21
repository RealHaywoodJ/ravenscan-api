
const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 RavenScan E2E Tests\n');

  let apiKey = process.env.RAVENSCAN_API_KEY;
  if (!apiKey) {
    apiKey = await askQuestion('Enter your RavenScan API key: ');
  }

  try {
    // Test 1: API Check endpoint
    console.log('1. Testing /check endpoint...');
    const checkResponse = await makeRequest('https://ravenscan-api.etmunson91.replit.app/check?name=testuser', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (checkResponse.status === 200) {
      console.log('✅ /check endpoint: PASS');
      
      // Validate JSON schema
      const data = checkResponse.data;
      const requiredFields = ['brand_name', 'domains', 'socials'];
      const hasAllFields = requiredFields.every(field => data.hasOwnProperty(field));
      
      if (hasAllFields) {
        console.log('✅ JSON schema validation: PASS');
      } else {
        console.log('❌ JSON schema validation: FAIL - Missing required fields');
      }
    } else {
      console.log(`❌ /check endpoint: FAIL (Status: ${checkResponse.status})`);
    }

    // Test 2: Frontend login endpoint
    console.log('\n2. Testing frontend /api/login...');
    const loginResponse = await makeRequest('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'test123' })
    });

    if (loginResponse.status === 200) {
      console.log('✅ /api/login: PASS');
    } else {
      console.log(`❌ /api/login: FAIL (Status: ${loginResponse.status})`);
    }

    // Test 3: Frontend feedback endpoint
    console.log('\n3. Testing frontend /api/feedback...');
    const feedbackResponse = await makeRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 'positive', query: 'testuser' })
    });

    if (feedbackResponse.status === 200) {
      console.log('✅ /api/feedback: PASS');
    } else {
      console.log(`❌ /api/feedback: FAIL (Status: ${feedbackResponse.status})`);
    }

    console.log('\n🎉 E2E tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  rl.close();
}

runTests();
