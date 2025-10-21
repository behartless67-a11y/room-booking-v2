// Configuration for BattenSpace
window.DashboardConfig = {
    // Azure Function endpoint for cached calendar data
    azureFunctionUrl: "https://roomtool-calendar-function.azurewebsites.net/api/getcalendar",

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
                    icsFile: "confa"
                },
                {
                    name: "Great Hall 100",
                    id: "greathall",
                    icsFile: "greathall"
                },
                {
                    name: "Seminar Room L039",
                    id: "seminar",
                    icsFile: "seminar"
                },
                {
                    name: "Student Lounge 206",
                    id: "studentlounge206",
                    icsFile: "studentlounge206"
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
                    icsFile: "pavx-upper"
                },
                {
                    name: "Pavilion X Basement Room 1",
                    id: "pavx-b1",
                    icsFile: "pavx-b1"
                },
                {
                    name: "Pavilion X Basement Room 2",
                    id: "pavx-b2",
                    icsFile: "pavx-b2"
                },
                {
                    name: "Pavilion X Basement Exhibit",
                    id: "pavx-exhibit",
                    icsFile: "pavx-exhibit"
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

    // Out of Office calendar
    outOfOfficeCalendar: {
        name: "Staff Out of Office",
        id: "staff-ooo",
        url: "https://www.trumba.com/calendars/staff-ooo.ics",
        description: "Staff out of office calendar",
        bookingUrl: "https://outlook.office365.com/calendar/0/action/compose?path=/calendar/action/compose&rru=addevent&subject=Out%20of%20Office&location=FBS-StaffOOO&body=I%20will%20be%20out%20of%20the%20office",
        enabled: true
    },
    
    // Legacy support - flatten buildings into single array for older dashboard versions
    icsFiles: [
        'https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics',
        'https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics',
        'https://outlook.office365.com/owa/calendar/4cedc3f0284648fcbee80dd7f6563bab@virginia.edu/211f4d478ee94feb8fe74fa4ed82a0b22636302730039956374/calendar.ics',
        'https://outlook.office365.com/owa/calendar/bfd63ea7933c4c3d965a632e5d6b703d@virginia.edu/05f41146b7274347a5e374b91f0e7eda6953039659626971784/calendar.ics',
        'https://outlook.office365.com/owa/calendar/52b9b2d41868473fac5d3e9963512a9b@virginia.edu/311e34fd14384759b006ccf185c1db677813060047149602177/calendar.ics',
        'https://outlook.office365.com/owa/calendar/fa3ecb9b47824ac0a36733c7212ccc97@virginia.edu/d23afabf93da4fa4b49d2be3ce290f7911116129854936607531/calendar.ics',
        'https://outlook.office365.com/owa/calendar/3f60cb3359dd40f7943b9de3b062b18d@virginia.edu/1e78265cf5eb44da903745ca3d872e6910017444746788834359/calendar.ics',
        'https://outlook.office365.com/owa/calendar/4df4134c83844cef9d9357180ccfb48c@virginia.edu/e46a84ae5d8842d4b33a842ddc5ff66c11207228220277930183/calendar.ics'
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