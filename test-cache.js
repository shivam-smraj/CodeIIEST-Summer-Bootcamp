const http = require('http');

function ping() {
  return new Promise((resolve) => {
    const start = Date.now();
    // Fetch live status for CF Contest 1101
    http.get('http://localhost:3000/api/live/status?contestId=1101&fromIndex=50000', (res) => {
      // Consume response data to free up memory
      let dataLen = 0;
      res.on('data', (chunk) => { dataLen += chunk.length; });
      res.on('end', () => {
        resolve({ time: Date.now() - start, bytes: dataLen });
      });
    }).on('error', (err) => {
      console.error("Error connecting to server:", err.message);
      resolve({ time: -1, bytes: 0 });
    });
  });
}

async function testCache() {
  console.log("==========================================");
  console.log("🔍 TESTING NEXT.JS CACHE ON /api/live/status?contestId=1101");
  console.log("   (This mimics the live contest scoreboard polling)");
  console.log("==========================================\n");
  
  console.log("Test 1: Initial Request (Fetching massive status log from CF API...)");
  const res1 = await ping();
  console.log(`⏱️  Time taken: ${res1.time} ms (Downloaded ${Math.round(res1.bytes / 1024)} KB)\n`);
  
  console.log("Test 2: Immediate Second Request (Should hit Next.js 15-second Cache)");
  const res2 = await ping();
  console.log(`⏱️  Time taken: ${res2.time} ms`);
  
  if (res2.time < res1.time * 0.5) {
    console.log(`✅ CACHE SUCCESS: Second request was instantly served from memory!`);
  } else {
    console.log(`⚠️  CACHE UNCERTAIN: Times were similar.`);
  }
  
  console.log("\nTest 3: Third Request (To confirm stability)");
  const res3 = await ping();
  console.log(`⏱️  Time taken: ${res3.time} ms\n`);
}

testCache();
