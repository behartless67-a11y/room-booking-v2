class ICSParser {
    constructor() {
        this.events = [];
        this.rooms = new Set();
    }

    parseICS(icsContent) {
        if (!icsContent || typeof icsContent !== 'string') {
            throw new Error('Invalid ICS content provided');
        }

        const lines = icsContent.split(/\r?\n/);
        let currentEvent = null;
        let inEvent = false;
        let eventCount = 0;

        console.log(`Processing ${lines.length} lines of ICS content`);

        for (let i = 0; i < lines.length; i++) {
            try {
                let line = lines[i] ? lines[i].trim() : '';
                
                // Handle line continuation (lines starting with space or tab)
                while (i + 1 < lines.length && lines[i + 1] && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
                    i++;
                    line += lines[i] ? lines[i].substring(1) : '';
                }

                if (line === 'BEGIN:VEVENT') {
                    inEvent = true;
                    currentEvent = {};
                    eventCount++;
                } else if (line === 'END:VEVENT' && inEvent) {
                    if (currentEvent && this.isValidEvent(currentEvent)) {
                        this.processEvent(currentEvent);
                        this.events.push(currentEvent);
                    }
                    currentEvent = null;
                    inEvent = false;
                } else if (inEvent && currentEvent && line) {
                    this.parseEventProperty(line, currentEvent);
                }
            } catch (error) {
                console.warn(`Error processing line ${i}: ${error.message}`);
                // Continue processing other lines
            }
        }

        console.log(`Processed ${eventCount} events, ${this.events.length} valid events added`);

        // Finalize room assignments
        this.finalizeRooms();

        return {
            events: this.events,
            rooms: Array.from(this.rooms).sort()
        };
    }

    parseEventProperty(line, event) {
        if (!line || !event) return;
        
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        try {
            const key = line.substring(0, colonIndex);
            const value = line.substring(colonIndex + 1);

            // Parse different property types
            if (key.startsWith('DTSTART')) {
                event.startTime = this.parseDateTime(value, key);
            } else if (key.startsWith('DTEND')) {
                event.endTime = this.parseDateTime(value, key);
            } else if (key === 'SUMMARY') {
                event.summary = this.unescapeValue(value);
            } else if (key === 'DESCRIPTION') {
                event.description = this.unescapeValue(value);
            } else if (key === 'LOCATION') {
                event.location = this.unescapeValue(value);
            } else if (key === 'UID') {
                event.uid = value;
            } else if (key === 'ORGANIZER') {
                event.organizer = this.parseOrganizer(value);
            }
        } catch (error) {
            console.warn(`Error parsing property: ${line}, error: ${error.message}`);
        }
    }

    parseDateTime(value, key) {
        if (!value || typeof value !== 'string') {
            console.warn('Invalid datetime value:', value);
            return null;
        }

        try {
            // Handle timezone info in the key (e.g., DTSTART;TZID=America/New_York:20231215T090000)
            const tzidMatch = key ? key.match(/TZID=([^;:]+)/) : null;
            const timezone = tzidMatch ? tzidMatch[1] : null;

            // Clean the value
            const cleanValue = value.trim();

            // Parse the datetime value
            if (cleanValue.length === 8) {
                // Date only (YYYYMMDD)
                const year = parseInt(cleanValue.substring(0, 4));
                const month = parseInt(cleanValue.substring(4, 6)) - 1;
                const day = parseInt(cleanValue.substring(6, 8));
                
                if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    throw new Error(`Invalid date components: ${cleanValue}`);
                }
                
                return new Date(year, month, day);
            } else if (cleanValue.length === 15 || cleanValue.length === 16) {
                // DateTime (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
                const year = parseInt(cleanValue.substring(0, 4));
                const month = parseInt(cleanValue.substring(4, 6)) - 1;
                const day = parseInt(cleanValue.substring(6, 8));
                const hour = parseInt(cleanValue.substring(9, 11));
                const minute = parseInt(cleanValue.substring(11, 13));
                const second = parseInt(cleanValue.substring(13, 15));

                if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
                    throw new Error(`Invalid datetime components: ${cleanValue}`);
                }

                if (cleanValue.endsWith('Z')) {
                    // UTC time
                    return new Date(Date.UTC(year, month, day, hour, minute, second));
                } else {
                    // Local time or timezone-specific
                    return new Date(year, month, day, hour, minute, second);
                }
            }
        } catch (error) {
            console.warn(`Error parsing datetime "${value}":`, error.message);
        }
        
        return null;
    }

    parseOrganizer(value) {
        const mailtoMatch = value.match(/^MAILTO:(.+)$/);
        if (mailtoMatch) {
            return mailtoMatch[1];
        }
        return value;
    }

    unescapeValue(value) {
        if (!value || typeof value !== 'string') {
            return value || '';
        }
        
        try {
            return value
                .replace(/\\n/g, '\n')
                .replace(/\\,/g, ',')
                .replace(/\\;/g, ';')
                .replace(/\\\\/g, '\\');
        } catch (error) {
            console.warn('Error unescaping value:', value, error);
            return value;
        }
    }

    isValidEvent(event) {
        return event.startTime && event.endTime && event.summary;
    }

    processEvent(event) {
        // Extract room information from location or summary
        let room = this.extractRoom(event.location || event.summary || '');
        
        // Debug logging
        console.log('Event:', event.summary, 'Location:', event.location, 'Extracted room:', room);
        
        // Specific ConfA debugging
        if (event.location && event.location.includes('ConfA')) {
            console.log(`🔍 CONFA DEBUG - Location: "${event.location}" -> Room: "${room}"`);
            console.log(`🔍 Room extraction test:`, this.extractRoom(event.location));
            console.log(`🔍 Room validation test:`, this.isValidRoom(room));
        }
        
        if (room) {
            event.room = room;
            this.rooms.add(room);
        } else {
            // Only add "Unknown Room" if we have no other rooms
            // This prevents event titles from being treated as rooms
            event.room = null; // Don't assign a default room yet
        }
    }

    // Call this after all events are processed to remove events without rooms
    finalizeRooms() {
        // Debug: Show all events before filtering
        console.log(`=== EVENTS BEFORE FILTERING ===`);
        console.log(`Total events before room filtering: ${this.events.length}`);
        
        // Count events by room assignment
        const roomCounts = {};
        this.events.forEach(event => {
            const roomKey = event.room || 'NULL_ROOM';
            roomCounts[roomKey] = (roomCounts[roomKey] || 0) + 1;
        });
        console.log(`Events by room before filtering:`, roomCounts);
        
        // Remove events without valid room assignments
        const originalCount = this.events.length;
        this.events = this.events.filter(event => event.room && event.room.trim() !== '');
        const filteredCount = originalCount - this.events.length;
        
        if (filteredCount > 0) {
            console.log(`Filtered out ${filteredCount} events without valid room assignments`);
        }
        
        // Debug: Show events after filtering
        const finalRoomCounts = {};
        this.events.forEach(event => {
            const roomKey = event.room || 'NULL_ROOM';
            finalRoomCounts[roomKey] = (finalRoomCounts[roomKey] || 0) + 1;
        });
        console.log(`Events by room after filtering:`, finalRoomCounts);
        
        // Debug: Show Conference Room A events with dates
        const confAEvents = this.events.filter(event => event.room === 'Conference Room A L014');
        console.log(`=== CONFERENCE ROOM A L014 EVENTS DEBUG ===`);
        console.log(`Total Conference Room A L014 events: ${confAEvents.length}`);
        
        if (confAEvents.length > 0) {
            console.log(`First 5 Conference Room A events with dates:`);
            confAEvents.slice(0, 5).forEach(event => {
                console.log(`- "${event.summary}" on ${event.startTime.toDateString()} at ${event.startTime.toLocaleTimeString()}`);
            });
            
            // Show today's date for comparison
            const today = new Date();
            console.log(`Today's date for comparison: ${today.toDateString()}`);
            
            // Check if any events are for today
            const todayEvents = confAEvents.filter(event => 
                event.startTime.toDateString() === today.toDateString()
            );
            console.log(`Conference Room A events for today (${today.toDateString()}): ${todayEvents.length}`);
            if (todayEvents.length > 0) {
                todayEvents.forEach(event => {
                    console.log(`  - "${event.summary}" ${event.startTime.toLocaleTimeString()} - ${event.endTime.toLocaleTimeString()}`);
                });
            }
        }
        
        // Also ensure no "Events Without Room" or "Unknown Room" are in the rooms set
        this.rooms.delete('Events Without Room');
        this.rooms.delete('Unknown Room');
        
        // Normalize Conference Room A names - ensure they all have L014
        const normalizedRooms = new Set();
        const roomMappings = new Map();
        
        console.log('=== ROOM NORMALIZATION DEBUG ===');
        console.log('All rooms before normalization:', Array.from(this.rooms));
        
        this.rooms.forEach(room => {
            console.log(`Checking room: "${room}"`);
            if (room === 'Conference Room A' || room === 'Room A') {
                // Generic Conference Room A or Room A should become Conference Room A L014
                const fullName = 'Conference Room A L014';
                normalizedRooms.add(fullName);
                roomMappings.set(room, fullName);
                console.log(`✅ Normalizing room: "${room}" → "${fullName}"`);
            } else {
                normalizedRooms.add(room);
                console.log(`✓ Keeping room as-is: "${room}"`);
            }
        });
        
        console.log('All rooms after normalization:', Array.from(normalizedRooms));
        console.log('Room mappings:', Array.from(roomMappings.entries()));
        
        // Update room names in events
        if (roomMappings.size > 0) {
            console.log(`=== UPDATING EVENTS ===`);
            console.log(`Room mappings to apply:`, Array.from(roomMappings.entries()));
            
            let updatedEventCount = 0;
            this.events.forEach(event => {
                if (roomMappings.has(event.room)) {
                    const oldRoom = event.room;
                    event.room = roomMappings.get(event.room);
                    console.log(`Updated event room: "${oldRoom}" → "${event.room}" for event "${event.summary}"`);
                    updatedEventCount++;
                }
            });
            
            console.log(`✅ Updated ${updatedEventCount} events with new room names`);
        } else {
            console.log(`No room mappings to apply - no events will be updated`);
        }
        
        this.rooms = normalizedRooms;
    }

    extractRoom(text) {
        if (!text) return null;
        
        // Clean up the text and handle multiple location formats (separated by semicolons)
        const cleanText = text.trim();
        
        // Handle locations with multiple parts separated by semicolons (like "Conference Room A\; FBS-ConfA-L014")
        const locationParts = cleanText.split(/[;\,]/).map(part => part.trim());
        
        // Debug logging for FBS locations
        if (cleanText.includes('FBS-')) {
            console.log('Processing FBS location:', cleanText, 'Parts:', locationParts);
        }
        // Debug logging for ConfA specifically
        if (cleanText.includes('ConfA')) {
            console.log('Found ConfA location:', cleanText, 'Parts:', locationParts);
        }
        
        // Try to extract from each part, prioritizing FBS format
        for (const part of locationParts) {
            const room = this.extractRoomFromSingleText(part.trim());
            if (room) {
                console.log(`Extracted room "${room}" from part "${part}"`);
                return room;
            }
        }
        
        return null; // Don't fall back to treating arbitrary text as rooms
    }
    
    extractRoomFromSingleText(text) {
        if (!text) return null;
        
        const roomPatterns = [
            // UVA FBS format (like "FBS-GreatHall-100", "FBS-SeminarRoom-L039", "FBS-ConfA-L014")
            /FBS-(GreatHall|BattenHall|SeminarRoom|ConfA)-(L?\d{1,4}[a-z]?)/i,
            
            // Hall with room number patterns (like "Great Hall 100", "Batten Hall 201")
            /\b(great\s+hall|batten\s+hall|alumni\s+hall)\s+(\d{1,4}[a-z]?)\b/i,
            
            // Specific building patterns with room numbers
            /\b(batten)\s+(\d{1,4}[a-z]?)\b/i,
            
            // Room with number patterns
            /\broom\s+([a-z]*\d{1,4}[a-z]?)\b/i,
            
            // Conference room with identifier - this will capture "Conference Room A" from the semicolon-separated location
            /\bconference\s+room\s+([a-z]\b|\d{1,4}[a-z]?\b)/i,
            
            // Simple patterns like "Room A", "Room 123"
            /\b(room\s+[a-z]\b|room\s+\d{1,4}[a-z]?\b)/i
        ];

        for (const pattern of roomPatterns) {
            const match = text.match(pattern);
            console.log(`Testing pattern ${pattern} on "${text}": ${match ? 'MATCH' : 'NO MATCH'}`);
            if (match) {
                console.log(`Match details:`, match);
                let room = '';
                
                // Handle FBS format specially
                if (match[0].includes('FBS-')) {
                    const building = match[1].toLowerCase();
                    const roomNum = match[2];
                    console.log(`FBS format - building: "${building}", roomNum: "${roomNum}"`);
                    if (building === 'greathall') {
                        room = `Great Hall ${roomNum}`;
                    } else if (building === 'battenhall') {
                        room = `Batten Hall ${roomNum}`;
                    } else if (building === 'seminarroom') {
                        room = `Seminar Room ${roomNum}`;
                    } else if (building.toLowerCase() === 'confa') {
                        room = `Conference Room A ${roomNum}`;
                        console.log(`✅ ConfA matched! Created room: "${room}"`);
                    }
                } else if (match.length > 2 && match[2]) {
                    // Pattern with building and room number
                    room = `${match[1].trim()} ${match[2].trim()}`;
                } else if (match[1]) {
                    room = match[1].trim();
                }
                
                console.log(`Extracted room before validation: "${room}"`);
                
                // Additional validation for the matched room
                if (this.isValidRoom(room)) {
                    console.log(`✅ Room validated successfully: "${room}"`);
                    return room;
                } else {
                    console.log(`❌ Room failed validation: "${room}"`);
                }
            }
        }

        return null; // Don't fall back to treating arbitrary text as rooms
    }

    isValidRoom(roomText) {
        if (!roomText || typeof roomText !== 'string') return false;
        
        const room = roomText.trim().toLowerCase();
        
        // Only accept very specific room-like patterns - require room numbers for halls
        const validRoomPatterns = [
            // Hall + room number (like "great hall 100", "batten hall 201", "seminar room L039", "conference room a L014")
            /^(great\s+hall|batten\s+hall|alumni\s+hall|seminar\s+room|conference\s+room\s+a)\s+(L?\d{1,4}[a-z]?)$/i,
            
            // Building + room number (like "batten 201")
            /^batten\s+\d{1,4}[a-z]?$/i,
            
            // Room + identifier (like "room 123", "room a")
            /^room\s+([a-z]\d*|\d{1,4}[a-z]?)$/i,
            
            // Conference room patterns
            /^conference\s+room\s+([a-z]|\d{1,4}[a-z]?)$/i
        ];
        
        // Must match at least one valid room pattern
        const isValidPattern = validRoomPatterns.some(pattern => pattern.test(room));
        
        if (!isValidPattern) {
            return false;
        }
        
        // Additional blacklist for common false positives including random numbers
        const invalidPatterns = [
            /\b(zoom|teams|online|virtual|phone|meeting|conference|call|session|training|dinner|workshop|cleaning|setup|teardown|retreat|dialogue|headshots|iftar|study)\b/i,
            /@/,
            /\.(com|org|edu|gov)/i,
            /\b(martin|luther|king|mpp|msa|council|economics|mental|health|constitution|day|evening|assistant)\b/i,
            // Block standalone 4-digit numbers that are likely not rooms (like "7559")
            /^\d{4}$/,
            // Block common false positive patterns
            /\b(main|general|public|private|personal|staff|admin|office|temp|temporary)\b/i
        ];
        
        // Final check against blacklist
        return !invalidPatterns.some(pattern => pattern.test(room));
    }

    getEventsForRoom(room, date = null) {
        let filtered = this.events.filter(event => 
            !room || event.room === room
        );

        if (date) {
            const targetDate = new Date(date);
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.startTime);
                return eventDate.toDateString() === targetDate.toDateString();
            });
        }

        return filtered.sort((a, b) => a.startTime - b.startTime);
    }

    getAvailableRooms(startTime, endTime) {
        const busyRooms = new Set();
        
        this.events.forEach(event => {
            if (event.room && 
                event.startTime < endTime && 
                event.endTime > startTime) {
                busyRooms.add(event.room);
            }
        });

        return Array.from(this.rooms).filter(room => !busyRooms.has(room));
    }

    // Debug method to inspect parsed events
    getDebugInfo() {
        return {
            totalEvents: this.events.length,
            rooms: Array.from(this.rooms),
            sampleEvents: this.events.slice(0, 5).map(event => ({
                summary: event.summary,
                location: event.location,
                extractedRoom: event.room,
                startTime: event.startTime,
                endTime: event.endTime
            }))
        };
    }
}