const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE size
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();

    // Listen to console messages
    page.on('console', async msg => {
        const text = msg.text();
        // Only show our debug messages
        if (text.includes('🔍') || text.includes('📱') || text.includes('❌')) {
            console.log(text);
            // If it's the debug for first event, also log the actual object
            if (text.includes('First event in array') || text.includes('First Conference Room A event')) {
                try {
                    const args = msg.args();
                    for (let i = 0; i < args.length; i++) {
                        const val = await args[i].jsonValue();
                        if (typeof val === 'object' && val !== null) {
                            console.log('   Object details:', JSON.stringify(val, null, 2));
                        }
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
        }
    });

    console.log('Opening https://roomres.thebattenspace.org/ ...');
    await page.goto('https://roomres.thebattenspace.org/');

    // Wait for page to load
    await page.waitForTimeout(5000);

    console.log('\n=== Page loaded, keeping browser open for inspection ===');
    console.log('Press Ctrl+C to close');

    // Keep the browser open
    await new Promise(() => {});
})();
