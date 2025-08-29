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
                    name: "Conference Room A",
                    id: "confa",
                    icsFile: "ics/ConfA.ics"
                },
                {
                    name: "Great Hall",
                    id: "greathall", 
                    icsFile: "ics/GreatHall.ics"
                },
                {
                    name: "Seminar Room",
                    id: "seminar",
                    icsFile: "ics/SeminarRoom.ics"
                },
                {
                    name: "Student Lounge",
                    id: "lounge",
                    icsFile: "ics/StudentLounge.ics"
                },
                {
                    name: "Pavilion X Upper Garden",
                    id: "pavx-upper",
                    icsFile: "ics/PavXUpperGarden.ics"
                },
                {
                    name: "Pavilion X Basement 1",
                    id: "pavx-b1",
                    icsFile: "ics/PavXBasement1.ics"
                },
                {
                    name: "Pavilion X Basement 2", 
                    id: "pavx-b2",
                    icsFile: "ics/PavXBasement2.ics"
                },
                {
                    name: "Pavilion X Exhibit",
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
    
    // Legacy support - flatten buildings into single array for older dashboard versions
    icsFiles: [
        'ics/ConfA.ics',
        'ics/GreatHall.ics', 
        'ics/SeminarRoom.ics',
        'ics/StudentLounge.ics',
        'ics/PavXUpperGarden.ics',
        'ics/PavXBasement1.ics',
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
        autoRefreshMinutes: 30,
        
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