module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // CORS headers
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        context.res.status = 200;
        return;
    }

    const room = req.query.room;

    if (!room) {
        context.res = {
            ...context.res,
            status: 400,
            body: "Please provide a room parameter"
        };
        return;
    }

    // Room mappings - Updated with Student Lounge 206
    const roomMappings = {
        "confa": "https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics",
        "greathall": "https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics",
        "seminar": "https://outlook.office365.com/owa/calendar/4cedc3f0284648fcbee80dd7f6563bab@virginia.edu/211f4d478ee94feb8fe74fa4ed82a0b22636302730039956374/calendar.ics",
        "studentlounge206": "https://outlook.office365.com/owa/calendar/bfd63ea7933c4c3d965a632e5d6b703d@virginia.edu/05f41146b7274347a5e374b91f0e7eda6953039659626971784/calendar.ics",
        "pavx-upper": "https://outlook.office365.com/owa/calendar/52b9b2d41868473fac5d3e9963512a9b@virginia.edu/311e34fd14384759b006ccf185c1db677813060047149602177/calendar.ics",
        "pavx-b1": "https://outlook.office365.com/owa/calendar/fa3ecb9b47824ac0a36733c7212ccc97@virginia.edu/d23afabf93da4fa4b49d2be3ce290f7911116129854936607531/calendar.ics",
        "pavx-b2": "https://outlook.office365.com/owa/calendar/3f60cb3359dd40f7943b9de3b062b18d@virginia.edu/1e78265cf5eb44da903745ca3d872e6910017444746788834359/calendar.ics",
        "pavx-exhibit": "https://outlook.office365.com/owa/calendar/4df4134c83844cef9d9357180ccfb48c@virginia.edu/e46a84ae5d8842d4b33a842ddc5ff66c11207228220277930183/calendar.ics"
    };

    const calendarUrl = roomMappings[room];

    if (!calendarUrl) {
        context.res = {
            ...context.res,
            status: 404,
            body: `Room '${room}' not found`
        };
        return;
    }

    try {
        const https = require('https');
        const { URL } = require('url');

        const url = new URL(calendarUrl);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'User-Agent': 'RoomTool-Calendar-Function/1.0'
            }
        };

        const data = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(data);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });

        context.res = {
            ...context.res,
            status: 200,
            headers: {
                ...context.res.headers,
                "Content-Type": "text/calendar"
            },
            body: data
        };

    } catch (error) {
        context.log('Error fetching calendar:', error);
        context.res = {
            ...context.res,
            status: 500,
            body: `Error fetching calendar: ${error.message}`
        };
    }
};