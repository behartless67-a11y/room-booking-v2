// Azure Application Insights Analytics Configuration
// This file handles all analytics tracking for BattenSpace

class BattenAnalytics {
    constructor() {
        this.enabled = false;
        this.appInsights = null;
        this.sessionStartTime = Date.now();

        // Initialize Application Insights if connection string is available
        this.initialize();
    }

    initialize() {
        // Application Insights connection string will be injected via Azure Static Web Apps configuration
        // For now, we'll set it up to work with environment variables
        const connectionString = window.APPINSIGHTS_CONNECTION_STRING || null;

        if (!connectionString) {
            console.log('📊 Analytics: Application Insights not configured (running locally)');
            // In local mode, log events to console instead
            this.enabled = true;
            return;
        }

        try {
            // Initialize Application Insights SDK
            const snippet = {
                config: {
                    connectionString: connectionString,
                    enableAutoRouteTracking: true,
                    enableCorsCorrelation: true,
                    enableRequestHeaderTracking: true,
                    enableResponseHeaderTracking: true,
                    disableFetchTracking: false,
                    enableAjaxPerfTracking: true
                }
            };

            // Load App Insights SDK
            this.loadAppInsightsSDK(snippet);
            this.enabled = true;
            console.log('📊 Analytics: Application Insights initialized');
        } catch (error) {
            console.error('📊 Analytics initialization failed:', error);
        }
    }

    loadAppInsightsSDK(snippet) {
        // This will be replaced with actual Application Insights SDK loading
        // For now, create a mock implementation that logs to console
        this.appInsights = {
            trackPageView: (properties) => {
                console.log('📊 Page View:', properties);
            },
            trackEvent: (event) => {
                console.log('📊 Event:', event.name, event.properties);
            },
            trackMetric: (metric) => {
                console.log('📊 Metric:', metric.name, metric.average);
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
    // This will fetch data from Application Insights API
    async getAnalyticsData(timeRange = '7d') {
        // This will be implemented to fetch from Application Insights API
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
