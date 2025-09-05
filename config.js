// Configuration for BattenSpace
window.DashboardConfig = {
    // Room organization by building/location
    // Each building can have multiple rooms with their ICS files
    buildings: [
        {
            name: "Garrett Hall",
            id: "garrett",
            rooms: [
                {
                    name: "Conference Room A L014",
                    id: "confa",
                    icsFile: "https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics"
                },
                {
                    name: "Great Hall 100",
                    id: "greathall", 
                    icsFile: "https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics"
                },
                {
                    name: "Seminar Room L039",
                    id: "seminar",
                    icsFile: "https://outlook.office365.com/owa/calendar/4cedc3f0284648fcbee80dd7f6563bab@virginia.edu/211f4d478ee94feb8fe74fa4ed82a0b22636302730039956374/calendar.ics"
                },
                {
                    name: "Student Lounge 206",
                    id: "lounge",
                    icsFile: "ics/StudentLounge.ics"
                }
            ]
        },
        {
            name: "Pavilion X",
            id: "pavilionx",
            rooms: [
                {
                    name: "Pavilion X Upper Garden",
                    id: "pavx-upper",
                    icsFile: "ics/PavXUpperGarden.ics"
                },
                {
                    name: "Pavilion X Basement Room 1",
                    id: "pavx-b1",
                    icsFile: "https://outlook.office365.com/owa/calendar/fa3ecb9b47824ac0a36733c7212ccc97@virginia.edu/d23afabf93da4fa4b49d2be3ce290f7911116129854936607531/calendar.ics"
                },
                {
                    name: "Pavilion X Basement Room 2", 
                    id: "pavx-b2",
                    icsFile: "ics/PavXBasement2.ics"
                },
                {
                    name: "Pavilion X Basement Exhibit",
                    id: "pavx-exhibit",
                    icsFile: "ics/PavXExhibit.ics"
                }
            ]
        }
        // Future buildings can be added here:
        // {
        //     name: "West Complex",
        //     id: "westcomplex",
        //     rooms: [
        //         {
        //             name: "West Meeting Room 1",
        //             id: "west-1",
        //             icsFile: "ics/WestRoom1.ics"
        //         }
        //     ]
        // }
    ],
    
    // External event calendars for contextual information
    eventCalendars: [
        {
            name: "Batten School Events",
            id: "batten-events",
            url: "https://www.trumba.com/calendars/batten-school-events.ics",
            description: "Official Batten School academic and administrative events",
            color: "#e57200", // UVA Orange
            enabled: true,
            // Room name mappings to match event locations with our tracked rooms
            roomMappings: {
                "Great Hall (100)": "Great Hall 100",
                "Conference Room A": "Conference Room A L014", 
                "Seminar Room": "Seminar Room L039",
                "Student Lounge": "Student Lounge 206",
                "Garrett Hall": "Garrett Hall" // Generic building reference
            }
        }
    ],
    
    // Legacy support - flatten buildings into single array for older dashboard versions
    icsFiles: [
        'https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics',
        'https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics',
        'https://outlook.office365.com/owa/calendar/4cedc3f0284648fcbee80dd7f6563bab@virginia.edu/211f4d478ee94feb8fe74fa4ed82a0b22636302730039956374/calendar.ics',
        'ics/StudentLounge.ics',
        'ics/PavXUpperGarden.ics',
        'https://outlook.office365.com/owa/calendar/fa3ecb9b47824ac0a36733c7212ccc97@virginia.edu/d23afabf93da4fa4b49d2be3ce290f7911116129854936607531/calendar.ics',
        'ics/PavXBasement2.ics',
        'ics/PavXExhibit.ics'
    ],
    
    // Dashboard settings
    settings: {
        // Default view on load
        defaultView: 'day', // 'day', 'week', 'month'
        
        // Time range for day view (24-hour format)
        dayViewStart: 8,  // 8 AM
        dayViewEnd: 20,   // 8 PM
        
        // Auto-refresh interval in minutes (0 to disable)
        autoRefreshMinutes: 5, // Refresh every 5 minutes
        
        // Organization branding
        organizationName: 'BattenSpace',
        organizationLogo: null, // URL to logo image, or null
        
        // Display options
        showBuildingHeaders: true, // Show building sections in room list
        collapsibleBuildings: true, // Allow building sections to be collapsed
        
        // Color scheme (CSS custom properties)
        colors: {
            primary: '#232d4b',    // UVA Navy
            secondary: '#e57200',  // UVA Orange
            success: '#10b981',    // Green for available
            warning: '#f59e0b',    // Orange for partial
            danger: '#ef4444'      // Red for busy
        }
    }
};