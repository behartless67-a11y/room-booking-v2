// Azure Application Insights Analytics Configuration
// This file handles all analytics tracking for BattenSpace

class BattenAnalytics {
    constructor() {
        this.enabled = false;
        this.appInsights = null;
        this.sessionStartTime = Date.now();

        // Initialize Application Insights
        this.initialize();
    }

    initialize() {
        // Application Insights Instrumentation Key
        // This will be replaced with your actual key from Azure Portal
        const instrumentationKey = window.APPINSIGHTS_INSTRUMENTATION_KEY || 'YOUR_INSTRUMENTATION_KEY_HERE';

        if (!instrumentationKey || instrumentationKey === 'YOUR_INSTRUMENTATION_KEY_HERE') {
            console.log('📊 Analytics: Application Insights key not configured');
            console.log('📊 Analytics: Running in console-only mode');
            // Enable console logging mode
            this.enabled = true;
            this.setupConsoleMode();
            return;
        }

        try {
            // Load Application Insights SDK from CDN
            this.loadAppInsightsScript(instrumentationKey);
            this.enabled = true;
            console.log('📊 Analytics: Application Insights SDK loading...');
        } catch (error) {
            console.error('📊 Analytics initialization failed:', error);
            this.setupConsoleMode();
        }
    }

    loadAppInsightsScript(instrumentationKey) {
        // Application Insights JavaScript SDK snippet
        const sdkScript = document.createElement('script');
        sdkScript.type = 'text/javascript';
        sdkScript.async = true;
        sdkScript.src = 'https://js.monitor.azure.com/scripts/b/ai.2.min.js';

        sdkScript.onload = () => {
            // Initialize App Insights after SDK loads
            const snippet = {
                config: {
                    instrumentationKey: instrumentationKey,
                    enableAutoRouteTracking: true,
                    disableFetchTracking: false,
                    enableCorsCorrelation: true,
                    enableRequestHeaderTracking: true,
                    enableResponseHeaderTracking: true,
                    autoTrackPageVisitTime: true,
                    disableAjaxTracking: false
                }
            };

            // Initialize ApplicationInsights
            this.appInsights = new Microsoft.ApplicationInsights.ApplicationInsights(snippet);
            this.appInsights.loadAppInsights();
            this.appInsights.trackPageView();

            console.log('📊 Analytics: Application Insights SDK loaded successfully');
        };

        document.head.appendChild(sdkScript);
    }

    setupConsoleMode() {
        // Create mock implementation that logs to console
        this.appInsights = {
            trackPageView: (data) => {
                console.log('📊 Page View:', data?.name || window.location.pathname);
            },
            trackEvent: (data) => {
                console.log('📊 Event:', data.name, data.properties);
            },
            trackMetric: (data) => {
                console.log('📊 Metric:', data.name, data.average);
            }
        };
    }

    // Track page views
    trackPageView(pageName, properties = {}) {
        if (!this.enabled) return;

        const pageData = {
            name: pageName,
            uri: window.location.href,
            properties: {
                ...properties,
                timestamp: new Date().toISOString()
            }
        };

        if (this.appInsights) {
            this.appInsights.trackPageView(pageData);
        }
    }

    // Track room views
    trackRoomView(roomName, viewMode = 'day') {
        if (!this.enabled) return;

        this.appInsights?.trackEvent({
            name: 'RoomViewed',
            properties: {
                roomName: roomName,
                viewMode: viewMode,
                timestamp: new Date().toISOString(),
                dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                hour: new Date().getHours()
            }
        });
    }

    // Track view mode changes
    trackViewModeChange(oldMode, newMode) {
        if (!this.enabled) return;

        this.appInsights?.trackEvent({
            name: 'ViewModeChanged',
            properties: {
                fromMode: oldMode,
                toMode: newMode,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Track room search
    trackRoomSearch(searchTerm, resultsCount) {
        if (!this.enabled) return;

        this.appInsights?.trackEvent({
            name: 'RoomSearched',
            properties: {
                searchTerm: searchTerm,
                resultsCount: resultsCount,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Track event clicks
    trackEventClick(eventName, roomName) {
        if (!this.enabled) return;

        this.appInsights?.trackEvent({
            name: 'EventClicked',
            properties: {
                eventName: eventName,
                roomName: roomName,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Track dashboard type usage
    trackDashboardView(dashboardType) {
        if (!this.enabled) return;

        this.appInsights?.trackEvent({
            name: 'DashboardViewed',
            properties: {
                dashboardType: dashboardType, // 'main', 'advanced', 'simple', 'basic'
                timestamp: new Date().toISOString()
            }
        });
    }

    // Track errors
    trackError(error, context = {}) {
        if (!this.enabled) return;

        console.error('📊 Error tracked:', error);

        this.appInsights?.trackEvent({
            name: 'Error',
            properties: {
                message: error.message || error,
                context: JSON.stringify(context),
                timestamp: new Date().toISOString()
            }
        });
    }

    // Track session duration on page unload
    trackSessionEnd() {
        if (!this.enabled) return;

        const sessionDuration = (Date.now() - this.sessionStartTime) / 1000; // seconds

        this.appInsights?.trackMetric({
            name: 'SessionDuration',
            average: sessionDuration,
            properties: {
                timestamp: new Date().toISOString()
            }
        });
    }

    // Get analytics data (for analytics dashboard)
    async getAnalyticsData(timeRange = '7d') {
        // This would fetch from Application Insights API
        // For now, return mock data structure
        return {
            visitors: {
                total: 0,
                unique: 0,
                returning: 0
            },
            roomViews: {},
            popularRooms: [],
            viewModes: {
                day: 0,
                week: 0,
                month: 0
            },
            peakHours: [],
            dashboardTypes: {
                main: 0,
                advanced: 0,
                simple: 0,
                basic: 0
            }
        };
    }
}

// Initialize analytics globally
window.BattenAnalytics = new BattenAnalytics();

// Track session end on page unload
window.addEventListener('beforeunload', () => {
    window.BattenAnalytics.trackSessionEnd();
});

// Track initial page view
window.addEventListener('DOMContentLoaded', () => {
    const pageName = document.title || 'BattenSpace Dashboard';
    window.BattenAnalytics.trackPageView(pageName);
});
