const fs = require('fs');
const path = require('path');

// Scan services folder for HTML files
const servicesDir = './scripts/services';
const outputFile = './scripts/services/services-list.json';

try {
  // Read all files in services directory
  const files = fs.readdirSync(servicesDir);
  
  // Filter for HTML files (excluding config files)
  const htmlFiles = files.filter(file => 
    file.endsWith('.html') && 
    !file.includes('config') && 
    !file.includes('template')
  );
  
  // Create the services list
  const servicesList = {
    services: htmlFiles,
    generated: new Date().toISOString()
  };
  
  // Write to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(servicesList, null, 2));
  
  console.log(`✅ Found ${htmlFiles.length} service(s):`);
  htmlFiles.forEach(file => console.log(`   - ${file}`));
  console.log(`📝 Generated: ${outputFile}`);
  
} catch (error) {
  console.error('❌ Error building services list:', error.message);
  process.exit(1);
}