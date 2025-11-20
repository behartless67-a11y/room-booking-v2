// Simple health check function to enable Application Insights for Static Web App
module.exports = async function (context, req) {
    context.log('Health check endpoint called');

    const response = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'BattenSpace API is running',
        version: '1.0.0'
    };

    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: response
    };
};
