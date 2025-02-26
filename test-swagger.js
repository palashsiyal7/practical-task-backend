/**
 * This is a simple test script for verifying the Swagger setup.
 * It loads the YAML file and checks if it's valid.
 */

const YAML = require('yamljs');
const path = require('path');

try {
  console.log('Testing Swagger YAML file loading...');
  
  // Attempt to load the YAML file
  const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
  
  // Quick validation check - make sure essential parts exist
  if (!swaggerDocument.info || !swaggerDocument.paths || !swaggerDocument.components) {
    throw new Error('Swagger file is missing required sections (info, paths, or components)');
  }
  
  // Check that we have defined some endpoints
  const endpointCount = Object.keys(swaggerDocument.paths).length;
  console.log(`✅ Swagger file loaded successfully! Found ${endpointCount} API endpoints.`);
  
  // Display basic info 
  console.log(`API Title: ${swaggerDocument.info.title}`);
  console.log(`API Version: ${swaggerDocument.info.version}`);
  console.log(`API Description: ${swaggerDocument.info.description}`);
  
  console.log('\nAPI documentation is ready to be served at: http://localhost:8000/api-docs');
  console.log('Run the server with: npm run dev');
} catch (error) {
  console.error('❌ Error loading Swagger file:', error.message);
  process.exit(1);
} 