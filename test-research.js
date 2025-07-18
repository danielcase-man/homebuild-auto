// Simple test script to verify the research API
const testResearch = async () => {
  const testData = {
    location: "Austin, TX",
    projectType: "Custom home construction",
    builderType: "Owner-builder",
    budget: "$500,000",
    timeline: "12 months"
  };

  try {
    console.log('Testing lender research API...');
    const response = await fetch('http://localhost:3001/api/research/lenders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Lender research API working!');
      console.log(`Found ${result.data.structuredData.length} lenders`);
      
      // Display first lender
      if (result.data.structuredData.length > 0) {
        const firstLender = result.data.structuredData[0];
        console.log('\nFirst lender:');
        console.log(`Name: ${firstLender.name}`);
        console.log(`Phone: ${firstLender.contact?.phone || 'N/A'}`);
        console.log(`Email: ${firstLender.contact?.email || 'N/A'}`);
        console.log(`Features: ${firstLender.features?.join(', ') || 'N/A'}`);
      }
    } else {
      console.log('❌ Research API failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

// Run the test
testResearch();