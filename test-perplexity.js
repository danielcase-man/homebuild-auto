#!/usr/bin/env node

/**
 * Quick test of lumber supplier research using mock Perplexity MCP integration
 */

// Mock MCP client for testing
class MockMCPClient {
  async research(query) {
    console.log(`🔍 Mock Perplexity Research Query: ${query.query}`)
    console.log(`📍 Location: ${query.location || 'Not specified'}`)
    console.log(`🎯 Domain: ${query.domain || 'general'}`)
    
    // Simulate research delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (query.query.toLowerCase().includes('lumber') && query.location?.includes('Liberty Hill')) {
      return {
        summary: "Found several lumber suppliers and building material retailers in and around Liberty Hill, TX area.",
        keyFindings: [
          "Home Depot and Lowe's locations within 15 miles in nearby Georgetown and Cedar Park",
          "Local lumber yards: Liberty Hill Lumber, Cedar Park Building Supply",
          "Specialty suppliers: Austin Hardwood & Millwork (20 miles south)",
          "84 Lumber has a location in Round Rock (18 miles)",
          "Several independent building supply stores in the greater Austin area"
        ],
        vendors: [
          {
            name: "Liberty Hill Lumber Co.",
            location: "Liberty Hill, TX",
            type: "Local lumber yard",
            specialties: ["Framing lumber", "Decking", "Fencing materials"],
            contact: "Estimated based on typical local operations",
            distance: "0 miles"
          },
          {
            name: "Home Depot - Georgetown",
            location: "Georgetown, TX",
            type: "Big box retailer",
            specialties: ["General building materials", "Lumber", "Hardware"],
            contact: "Multiple locations in area",
            distance: "12 miles"
          },
          {
            name: "Lowe's - Cedar Park",
            location: "Cedar Park, TX",
            type: "Big box retailer", 
            specialties: ["Building materials", "Lumber", "Tools"],
            contact: "Standard retail hours",
            distance: "15 miles"
          },
          {
            name: "84 Lumber - Round Rock",
            location: "Round Rock, TX",
            type: "Specialty lumber supplier",
            specialties: ["Professional grade lumber", "Trusses", "Millwork"],
            contact: "Commercial and contractor sales",
            distance: "18 miles"
          },
          {
            name: "Austin Hardwood & Millwork",
            location: "Austin, TX",
            type: "Specialty hardwood supplier",
            specialties: ["Hardwood lumber", "Custom millwork", "Exotic woods"],
            contact: "By appointment for contractors",
            distance: "20 miles"
          }
        ],
        sources: [
          { title: "Local business directories", url: "mock-source-1", relevance: 0.9 },
          { title: "Construction supplier databases", url: "mock-source-2", relevance: 0.8 },
          { title: "Contractor recommendations", url: "mock-source-3", relevance: 0.7 }
        ]
      }
    }
    
    return {
      summary: "No specific results found for this query.",
      keyFindings: [],
      vendors: [],
      sources: []
    }
  }
}

async function testLumberResearch() {
  console.log("🏗️  Testing Lumber Supplier Research for Liberty Hill, TX\n")
  
  const mcpClient = new MockMCPClient()
  
  const query = {
    query: "lumber suppliers and building material stores in Liberty Hill Texas area",
    domain: "vendors",
    location: "Liberty Hill, TX",
    timeframe: "current",
    structured: true,
    includePricing: false,
    includeContacts: true
  }
  
  try {
    const result = await mcpClient.research(query)
    
    console.log("📊 Research Results:")
    console.log("==================")
    console.log(`\n📝 Summary:\n${result.summary}\n`)
    
    if (result.keyFindings.length > 0) {
      console.log("🔍 Key Findings:")
      result.keyFindings.forEach((finding, i) => {
        console.log(`${i + 1}. ${finding}`)
      })
      console.log()
    }
    
    if (result.vendors.length > 0) {
      console.log("🏪 Found Vendors:")
      console.log("================")
      result.vendors.forEach((vendor, i) => {
        console.log(`\n${i + 1}. ${vendor.name}`)
        console.log(`   📍 Location: ${vendor.location}`)
        console.log(`   🏷️  Type: ${vendor.type}`)
        console.log(`   🎯 Specialties: ${vendor.specialties.join(', ')}`)
        console.log(`   📞 Contact: ${vendor.contact}`)
        console.log(`   📏 Distance: ${vendor.distance}`)
      })
    }
    
    console.log(`\n✅ Research completed successfully!`)
    console.log(`📊 Found ${result.vendors.length} vendors`)
    console.log(`📚 Used ${result.sources.length} sources`)
    
  } catch (error) {
    console.error("❌ Research failed:", error.message)
  }
}

// Run the test
testLumberResearch().catch(console.error)