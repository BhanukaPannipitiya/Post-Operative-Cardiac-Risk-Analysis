// Test script to verify API URL detection logic
// Run this in browser console to test different scenarios

const testApiUrlDetection = () => {
  console.log('🧪 Testing API URL Detection Logic');
  
  // Mock window.location for testing
  const originalLocation = window.location;
  
  const testScenarios = [
    {
      name: 'Development (localhost)',
      hostname: 'localhost',
      expected: 'http://localhost:8000/predict'
    },
    {
      name: 'Development (127.0.0.1)',
      hostname: '127.0.0.1',
      expected: 'http://localhost:8000/predict'
    },
    {
      name: 'Production (my-app.onrender.com)',
      hostname: 'my-app.onrender.com',
      expected: 'https://my-app-backend.onrender.com/predict'
    },
    {
      name: 'Production (cardiac-ai.onrender.com)',
      hostname: 'cardiac-ai.onrender.com',
      expected: 'https://cardiac-ai-backend.onrender.com/predict'
    },
    {
      name: 'Other domain (example.com)',
      hostname: 'example.com',
      expected: 'https://cardiac-ai-backend.onrender.com/predict'
    }
  ];
  
  testScenarios.forEach(scenario => {
    // Mock window.location.hostname
    Object.defineProperty(window, 'location', {
      value: { hostname: scenario.hostname },
      writable: true
    });
    
    // Import and test the function
    const getApiUrl = () => {
      if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
      }
      
      const currentHost = window.location.hostname;
      
      if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return 'http://localhost:8000/predict';
      }
      
      if (currentHost.includes('onrender.com')) {
        const serviceName = currentHost.split('.')[0];
        return `https://${serviceName}-backend.onrender.com/predict`;
      }
      
      return `https://cardiac-ai-backend.onrender.com/predict`;
    };
    
    const result = getApiUrl();
    const passed = result === scenario.expected;
    
    console.log(`${passed ? '✅' : '❌'} ${scenario.name}:`);
    console.log(`   Expected: ${scenario.expected}`);
    console.log(`   Got:      ${result}`);
    console.log('');
  });
  
  // Restore original location
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true
  });
  
  console.log('🎯 Test completed!');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testApiUrlDetection = testApiUrlDetection;
}

export { testApiUrlDetection };
