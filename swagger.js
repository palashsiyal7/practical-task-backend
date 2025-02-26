const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

/**
 * Configures and initializes Swagger documentation for the API
 * @param {Express} app - Express application instance
 */
const setupSwagger = (app) => {
  try {
    // Load the YAML file
    const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
    
    // Serve Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Actowiz API Documentation',
        customfavIcon: '/favicon.ico'
      })
    );
    
    console.log('✅ Swagger documentation initialized at /api-docs');
  } catch (error) {
    console.error('❌ Failed to initialize Swagger documentation:', error.message);
  }
};

module.exports = setupSwagger; 