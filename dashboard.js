class RoomDashboard {
    constructor() {
        this.parser = new ICSParser();
        this.currentDate = new Date();
        this.selectedRoom = '';
        this.viewPeriod = 'day';
        this.timeSlots = this.generateTimeSlots();
        this.userInfo = null;

        this.initializeUI();
        this.bindEvents();
        this.setDefaultDate();
        this.addTestButton(); // Add a test button for debugging
        this.loadUserInfo(); // Load authenticated user information
    }

    /**
     * Load authenticated user information from Azure Static Web Apps
     * This method calls the /.auth/me endpoint to get user details and roles
     */
    async loadUserInfo() {
        try {
            const response = await fetch('/.auth/me');
            const payload = await response.json();
            this.userInfo = payload.clientPrincipal;

            if (this.userInfo) {
                console.log('Authenticated user:', this.userInfo.userDetails);
                console.log('User roles:', this.userInfo.userRoles);
                this.displayUserInfo();
            } else {
                console.log('No authenticated user found');
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    /**
     * Display user information in the UI
     * Shows a welcome message with the user's name
     */
    displayUserInfo() {
        if (!this.userInfo) return;

        // Create user info display if it doesn't exist
        let userInfoDiv = document.getElementById('userInfo');
        if (!userInfoDiv) {
            userInfoDiv = document.createElement('div');
            userInfoDiv.id = 'userInfo';
            userInfoDiv.className = 'user-info';

            // Insert at the top of the dashboard
            const dashboard = document.querySelector('.dashboard');
            if (dashboard) {
                dashboard.insertBefore(userInfoDiv, dashboard.firstChild);
            }
        }

        // Display user name and logout link
        userInfoDiv.innerHTML = `
            <span class="user-name">Welcome, ${this.userInfo.userDetails}</span>
            <a href="/.auth/logout" class="logout-link">Logout</a>
        `;
    }

    /**
     * Check if the current user has a specific role
     * @param {string} role - The role to check for
     * @returns {boolean} True if user has the role
     */
    hasRole(role) {
        return this.userInfo &&
               this.userInfo.userRoles &&
               this.userInfo.userRoles.includes(role);
    }

    /**
     * Check if user is a staff member
     * @returns {boolean}
     */
    isStaff() {
        return this.hasRole('staff');
    }

    /**
     * Check if user is a community member
     * @returns {boolean}
     */
    isCommunity() {
        return this.hasRole('community');
    }

    addTestButton() {
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Load Test Data';
        testBtn.className = 'view-btn';
        testBtn.style.marginLeft = '10px';
        testBtn.addEventListener('click', () => this.loadTestData());
        document.querySelector('.view-toggle').appendChild(testBtn);
    }

    loadTestData() {
        // Create sample ICS content for testing
        const testIcsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test1@example.com
DTSTART:20250828T090000
DTEND:20250828T100000
SUMMARY:Morning Meeting
LOCATION:Batten Hall Room 201
DESCRIPTION:Team standup meeting
END:VEVENT
BEGIN:VEVENT
UID:test2@example.com
DTSTART:20250828T140000
DTEND:20250828T150000
SUMMARY:Project Review
LOCATION:Conference Room A
DESCRIPTION:Quarterly project review
END:VEVENT
BEGIN:VEVENT
UID:test3@example.com
DTSTART:20250828T160000
DTEND:20250828T170000
SUMMARY:Training Session
LOCATION:Room 3620
DESCRIPTION:New employee training
END:VEVENT
END:VCALENDAR`;

        try {
            this.showLoading(true);
            this.hideError();
            
            // Clear previous data
            this.parser = new ICSParser();
            console.log('Loading test data...');
            
            this.parser.parseICS(testIcsContent);
            console.log(`Test data loaded: ${this.parser.events.length} events, ${this.parser.rooms.size} rooms`);
            
            this.updateRoomDropdown();
            this.renderCurrentView();
            this.showLoading(false);
            
            this.showError('Test data loaded successfully! Check the Debug view to see parsed data.', false);
        } catch (error) {
            console.error('Test data loading error:', error);
            this.showError(`Error loading test data: ${error.message}`);
            this.showLoading(false);
        }
    }

    initializeUI() {
        this.roomSelect = document.getElementById('roomSelect');
        this.dateSelect = document.getElementById('dateSelect');
        this.viewPeriodSelect = document.getElementById('viewPeriod');
        this.icsFileInput = document.getElementById('icsFile');
        this.dashboard = document.getElementById('dashboard');
        this.roomGrid = document.getElementById('roomGrid');
        this.loadingMessage = document.getElementById('loadingMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.eventDetails = document.getElementById('eventDetails');
        this.eventInfo = document.getElementById('eventInfo');
        this.closeDetailsBtn = document.getElementById('closeDetails');
        
        // New view elements
        this.gridViewBtn = document.getElementById('gridViewBtn');
        this.listViewBtn = document.getElementById('listViewBtn');
        this.debugBtn = document.getElementById('debugBtn');
        this.gridView = document.getElementById('gridView');
        this.listView = document.getElementById('listView');
        this.debugView = document.getElementById('debugView');
        this.eventsList = document.getElementById('eventsList');
        this.debugInfo = document.getElementById('debugInfo');
        
        this.currentView = 'grid';
    }

    bindEvents() {
        this.icsFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.roomSelect.addEventListener('change', (e) => this.handleRoomSelection(e));
        this.dateSelect.addEventListener('change', (e) => this.handleDateSelection(e));
        this.viewPeriodSelect.addEventListener('change', (e) => this.handleViewPeriodChange(e));
        this.closeDetailsBtn.addEventListener('click', () => this.hideEventDetails());
        
        // View toggle buttons
        this.gridViewBtn.addEventListener('click', () => this.switchView('grid'));
        this.listViewBtn.addEventListener('click', () => this.switchView('list'));
        this.debugBtn.addEventListener('click', () => this.switchView('debug'));
        
        // Close event details when clicking outside the modal content
        this.eventDetails.addEventListener('click', (e) => {
            // Close if clicking on the backdrop (not the content)
            if (e.target === this.eventDetails) {
                this.hideEventDetails();
            }
        });
        
        // Also close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.eventDetails.classList.contains('hidden')) {
                this.hideEventDetails();
            }
        });
    }

    setDefaultDate() {
        const today = new Date();
        console.log(`Browser timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
        console.log(`Today's date: ${today.toString()}`);
        console.log(`Today's date string: ${today.toDateString()}`);
        this.dateSelect.value = today.toISOString().split('T')[0];
        this.currentDate = today;
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 7; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({
                    time: timeString,
                    hour: hour,
                    minute: minute
                });
            }
        }
        return slots;
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        this.showLoading(true);
        this.hideError();
        
        try {
            // Clear previous data
            this.parser = new ICSParser();
            
            // Process all selected .ics files
            for (const file of files) {
                console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
                
                if (!file.name.toLowerCase().endsWith('.ics')) {
                    throw new Error(`File ${file.name} is not an .ics file`);
                }
                
                const content = await this.readFile(file);
                console.log(`File content length: ${content.length}`);
                
                if (!content || content.trim().length === 0) {
                    throw new Error(`File ${file.name} appears to be empty`);
                }
                
                const result = this.parser.parseICS(content);
                console.log(`Parsed ${this.parser.events.length} events, found ${this.parser.rooms.size} rooms`);
            }

            if (this.parser.events.length === 0) {
                this.showError('No valid events found in the uploaded files. Please check that your .ics files contain calendar events.');
                this.showLoading(false);
                return;
            }

            this.updateRoomDropdown();
            this.renderCurrentView();
            this.showLoading(false);
        } catch (error) {
            console.error('File upload error:', error);
            this.showError(`Error processing files: ${error.message}`);
            this.showLoading(false);
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    updateRoomDropdown() {
        // Clear existing options except "All Rooms"
        while (this.roomSelect.children.length > 1) {
            this.roomSelect.removeChild(this.roomSelect.lastChild);
        }

        // Add room options
        const rooms = Array.from(this.parser.rooms).sort();
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room;
            option.textContent = room;
            this.roomSelect.appendChild(option);
        });
    }

    handleRoomSelection(event) {
        this.selectedRoom = event.target.value;
        this.renderCurrentView();
    }

    handleDateSelection(event) {
        this.currentDate = new Date(event.target.value);
        this.renderCurrentView();
    }

    handleViewPeriodChange(event) {
        this.viewPeriod = event.target.value;
        this.renderCurrentView();
    }

    switchView(viewType) {
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        
        if (viewType === 'grid') {
            this.gridViewBtn.classList.add('active');
            this.gridView.classList.remove('hidden');
            this.listView.classList.add('hidden');
            this.debugView.classList.add('hidden');
        } else if (viewType === 'list') {
            this.listViewBtn.classList.add('active');
            this.gridView.classList.add('hidden');
            this.listView.classList.remove('hidden');
            this.debugView.classList.add('hidden');
        } else if (viewType === 'debug') {
            this.debugBtn.classList.add('active');
            this.gridView.classList.add('hidden');
            this.listView.classList.add('hidden');
            this.debugView.classList.remove('hidden');
        }
        
        this.currentView = viewType;
        this.renderCurrentView();
    }

    renderCurrentView() {
        if (this.parser.events.length === 0) {
            this.roomGrid.innerHTML = '<div class="no-data">No calendar data loaded. Please upload .ics files.</div>';
            this.eventsList.innerHTML = '<div class="no-data">No calendar data loaded. Please upload .ics files.</div>';
            this.debugInfo.innerHTML = '<div class="no-data">No calendar data loaded. Please upload .ics files.</div>';
            return;
        }

        switch (this.currentView) {
            case 'grid':
                this.renderDashboard();
                break;
            case 'list':
                this.renderEventsList();
                break;
            case 'debug':
                this.renderDebugInfo();
                break;
        }
    }

    renderDashboard() {
        if (this.parser.events.length === 0) {
            this.roomGrid.innerHTML = '<div class="no-data">No calendar data loaded. Please upload .ics files.</div>';
            return;
        }

        this.renderTimeHeader();
        this.renderRoomRows();
    }

    renderTimeHeader() {
        const timeHeader = document.querySelector('.time-slots');
        if (!timeHeader) return;

        timeHeader.innerHTML = '';
        this.timeSlots.forEach(slot => {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'time-slot-header';
            timeDiv.textContent = slot.time;
            timeHeader.appendChild(timeDiv);
        });
    }

    renderRoomRows() {
        if (this.viewPeriod === 'week') {
            this.renderWeekView();
        } else if (this.viewPeriod === 'month') {
            this.renderMonthView();
        } else {
            this.renderDayView();
        }
    }

    renderDayView() {
        const rooms = this.selectedRoom ? [this.selectedRoom] : Array.from(this.parser.rooms).sort();
        
        console.log('Rendering day view. Rooms:', rooms);
        console.log('Total events:', this.parser.events.length);
        
        this.roomGrid.innerHTML = '';
        
        if (rooms.length === 0) {
            this.roomGrid.innerHTML = '<div class="no-data">No rooms found in the calendar data.</div>';
            return;
        }

        rooms.forEach(room => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'room-row';
            
            const roomLabel = document.createElement('div');
            roomLabel.className = 'room-name';
            roomLabel.textContent = room;
            rowDiv.appendChild(roomLabel);
            
            const slotsContainer = document.createElement('div');
            slotsContainer.className = 'time-slots-container';
            
            const roomEvents = this.parser.getEventsForRoom(room, this.currentDate);
            console.log(`Room ${room} events for ${this.currentDate.toDateString()}:`, roomEvents);
            
            this.renderTimeSlots(slotsContainer, roomEvents);
            
            rowDiv.appendChild(slotsContainer);
            this.roomGrid.appendChild(rowDiv);
        });
    }

    renderWeekView() {
        const { startDate, endDate } = this.getDateRange();
        const rooms = this.selectedRoom ? [this.selectedRoom] : Array.from(this.parser.rooms).sort();
        
        this.roomGrid.innerHTML = '';
        
        if (rooms.length === 0) {
            this.roomGrid.innerHTML = '<div class="no-data">No rooms found in the calendar data.</div>';
            return;
        }

        // Create week header
        const weekHeader = document.createElement('div');
        weekHeader.className = 'week-header';
        weekHeader.innerHTML = `<div class="room-name">Room</div>`;
        
        const daysContainer = document.createElement('div');
        daysContainer.className = 'days-container';
        
        for (let d = 0; d < 7; d++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + d);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-header';
            dayDiv.innerHTML = `
                <div class="day-name">${dayDate.toLocaleDateString('en', { weekday: 'short' })}</div>
                <div class="day-date">${dayDate.getDate()}</div>
            `;
            daysContainer.appendChild(dayDiv);
        }
        
        weekHeader.appendChild(daysContainer);
        this.roomGrid.appendChild(weekHeader);

        // Create room rows for the week
        rooms.forEach(room => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'room-row week-row';
            
            const roomLabel = document.createElement('div');
            roomLabel.className = 'room-name';
            roomLabel.textContent = room;
            rowDiv.appendChild(roomLabel);
            
            const daysContainer = document.createElement('div');
            daysContainer.className = 'days-container';
            
            for (let d = 0; d < 7; d++) {
                const dayDate = new Date(startDate);
                dayDate.setDate(startDate.getDate() + d);
                
                const dayEvents = this.getEventsInRange(room).filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate.toDateString() === dayDate.toDateString();
                });
                
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day-cell';
                
                if (dayEvents.length > 0) {
                    dayDiv.className += ' has-events';
                    dayDiv.innerHTML = `<div class="event-count">${dayEvents.length}</div>`;
                    dayDiv.addEventListener('click', () => this.showDayEvents(dayEvents, dayDate));
                } else {
                    dayDiv.className += ' no-events';
                }
                
                daysContainer.appendChild(dayDiv);
            }
            
            rowDiv.appendChild(daysContainer);
            this.roomGrid.appendChild(rowDiv);
        });
    }

    renderMonthView() {
        const { startDate, endDate } = this.getDateRange();
        const rooms = this.selectedRoom ? [this.selectedRoom] : Array.from(this.parser.rooms).sort();
        
        this.roomGrid.innerHTML = '';
        
        if (rooms.length === 0) {
            this.roomGrid.innerHTML = '<div class="no-data">No rooms found in the calendar data.</div>';
            return;
        }

        // Get first day of month and calculate calendar grid
        const firstDay = new Date(startDate);
        const lastDay = new Date(endDate);
        const firstCalendarDay = new Date(firstDay);
        firstCalendarDay.setDate(firstCalendarDay.getDate() - firstCalendarDay.getDay());
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.innerHTML = `
            <div class="month-title">${startDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</div>
            <div class="weekdays-header">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
        `;
        this.roomGrid.appendChild(monthHeader);

        // Create calendar grid
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        
        for (let week = 0; week < 6; week++) {
            const weekRow = document.createElement('div');
            weekRow.className = 'calendar-week';
            
            for (let day = 0; day < 7; day++) {
                const cellDate = new Date(firstCalendarDay);
                cellDate.setDate(firstCalendarDay.getDate() + (week * 7) + day);
                
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';
                
                if (cellDate.getMonth() !== startDate.getMonth()) {
                    dayCell.className += ' other-month';
                }
                
                const eventsForDay = this.getEventsInRange().filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate.toDateString() === cellDate.toDateString();
                });
                
                dayCell.innerHTML = `
                    <div class="day-number">${cellDate.getDate()}</div>
                    <div class="day-events">${eventsForDay.length > 0 ? `${eventsForDay.length} events` : ''}</div>
                `;
                
                if (eventsForDay.length > 0) {
                    dayCell.className += ' has-events';
                    dayCell.addEventListener('click', () => this.showDayEvents(eventsForDay, cellDate));
                }
                
                weekRow.appendChild(dayCell);
            }
            
            calendarGrid.appendChild(weekRow);
            
            // Stop if we've gone past the end of the month
            const lastDayOfWeek = new Date(firstCalendarDay);
            lastDayOfWeek.setDate(firstCalendarDay.getDate() + (week * 7) + 6);
            if (lastDayOfWeek > lastDay && week > 3) break;
        }
        
        this.roomGrid.appendChild(calendarGrid);
    }

    showDayEvents(events, date) {
        const eventInfo = `
            <div class="day-events-summary">
                <h4>Events for ${date.toLocaleDateString()}</h4>
                ${events.map(event => `
                    <div class="event-summary">
                        <strong>${event.summary}</strong><br>
                        <span class="event-time">${this.formatTime(event.startTime)} - ${this.formatTime(event.endTime)}</span><br>
                        ${event.room ? `<span class="event-room">Room: ${event.room}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        this.eventInfo.innerHTML = eventInfo;
        this.eventDetails.classList.remove('hidden');
    }

    renderTimeSlots(container, events) {
        container.innerHTML = '';
        
        console.log('Rendering time slots for events:', events.length);
        
        this.timeSlots.forEach(slot => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'time-slot';
            
            const slotTime = new Date(this.currentDate);
            slotTime.setHours(slot.hour, slot.minute, 0, 0);
            
            const event = this.findEventAtTime(events, slotTime);
            
            if (event) {
                console.log(`Found event at ${slot.time}:`, event.summary);
                
                slotDiv.classList.add('busy');
                slotDiv.title = `${event.summary}\n${this.formatTime(event.startTime)} - ${this.formatTime(event.endTime)}`;
                slotDiv.addEventListener('click', () => this.showEventDetails(event));
                
                // Always show event title for busy slots (not just at start)
                const eventLabel = document.createElement('div');
                eventLabel.className = 'event-label';
                
                if (this.isEventStart(event, slotTime)) {
                    // Show full title and time at event start
                    eventLabel.innerHTML = `
                        <div class="event-title">${event.summary}</div>
                        <div class="event-time-label">${this.formatTime(event.startTime)} - ${this.formatTime(event.endTime)}</div>
                    `;
                    eventLabel.classList.add('event-start');
                    slotDiv.classList.add('event-start-slot');
                } else {
                    // Show abbreviated title for continuation slots
                    eventLabel.innerHTML = `<div class="event-title-continue">${this.truncateText(event.summary, 20)}</div>`;
                    eventLabel.classList.add('event-continue');
                }
                
                slotDiv.appendChild(eventLabel);
            } else {
                slotDiv.classList.add('free');
                slotDiv.title = `Available at ${slot.time}`;
            }
            
            container.appendChild(slotDiv);
        });
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    findEventAtTime(events, targetTime) {
        return events.find(event => 
            event.startTime <= targetTime && event.endTime > targetTime
        );
    }

    isEventStart(event, slotTime) {
        const eventStart = new Date(event.startTime);
        const slotStart = new Date(slotTime);
        
        // Check if this slot is the start of the event (within 30 minutes)
        const timeDiff = Math.abs(eventStart - slotStart);
        return timeDiff < 30 * 60 * 1000; // 30 minutes in milliseconds
    }

    showEventDetails(event) {
        this.eventInfo.innerHTML = `
            <div class="event-detail">
                <strong>Event:</strong> ${event.summary}
            </div>
            <div class="event-detail">
                <strong>Time:</strong> ${this.formatTime(event.startTime)} - ${this.formatTime(event.endTime)}
            </div>
            <div class="event-detail">
                <strong>Room:</strong> ${event.room || 'Not specified'}
            </div>
            ${event.location ? `<div class="event-detail"><strong>Location:</strong> ${event.location}</div>` : ''}
            ${event.description ? `<div class="event-detail"><strong>Description:</strong> ${event.description}</div>` : ''}
            ${event.organizer ? `<div class="event-detail"><strong>Organizer:</strong> ${event.organizer}</div>` : ''}
        `;
        
        this.eventDetails.classList.remove('hidden');
    }

    hideEventDetails() {
        this.eventDetails.classList.add('hidden');
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showLoading(show) {
        if (show) {
            this.loadingMessage.classList.remove('hidden');
        } else {
            this.loadingMessage.classList.add('hidden');
        }
    }

    showError(message, isError = true) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        
        if (isError) {
            this.errorMessage.className = 'error';
        } else {
            this.errorMessage.className = 'success';
        }
        
        // Auto-hide success messages after 3 seconds
        if (!isError) {
            setTimeout(() => {
                this.hideError();
            }, 3000);
        }
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    // Utility method to get room availability summary
    getRoomAvailabilitySummary(date = null) {
        const targetDate = date || this.currentDate;
        const rooms = Array.from(this.parser.rooms);
        const summary = {};

        rooms.forEach(room => {
            const events = this.parser.getEventsForRoom(room, targetDate);
            const totalBusyTime = events.reduce((total, event) => {
                const duration = (event.endTime - event.startTime) / (1000 * 60); // minutes
                return total + duration;
            }, 0);

            summary[room] = {
                events: events.length,
                busyMinutes: totalBusyTime,
                busyHours: Math.round(totalBusyTime / 60 * 10) / 10
            };
        });

        return summary;
    }

    getDateRange() {
        const startDate = new Date(this.currentDate);
        const endDate = new Date(this.currentDate);
        
        switch (this.viewPeriod) {
            case 'week':
                // Get start of week (Sunday)
                startDate.setDate(startDate.getDate() - startDate.getDay());
                endDate.setDate(startDate.getDate() + 6);
                break;
            case 'month':
                // Get start and end of month
                startDate.setDate(1);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0); // Last day of current month
                break;
            case 'day':
            default:
                // Single day - no change needed
                break;
        }
        
        // Set to start and end of day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        return { startDate, endDate };
    }

    getEventsInRange(room = null) {
        const { startDate, endDate } = this.getDateRange();
        
        console.log(`Getting events in range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
        console.log(`Room filter: ${room || 'All rooms'}`);
        console.log(`Total events available: ${this.parser.events.length}`);
        
        let filtered = this.parser.events.filter(event => {
            const roomMatches = !room || event.room === room;
            const dateMatches = event.startTime >= startDate && event.startTime <= endDate;
            
            return roomMatches && dateMatches;
        });
        
        console.log(`Filtered events: ${filtered.length}`);
        
        return filtered.sort((a, b) => a.startTime - b.startTime);
    }

    renderEventsList() {
        console.log('Rendering events list...');
        
        const events = this.selectedRoom ? 
            this.getEventsInRange(this.selectedRoom) :
            this.getEventsInRange();

        console.log('Events for list view:', events.length);

        if (events.length === 0) {
            this.eventsList.innerHTML = '<div class="no-data">No events found for the selected criteria.</div>';
            return;
        }

        this.eventsList.innerHTML = '';
        
        events.forEach((event, index) => {
            console.log(`Rendering event ${index + 1}:`, event.summary);
            
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            
            // Build the HTML more carefully
            const eventHeaderHTML = `
                <div class="event-header">
                    <h3>${event.summary || 'Untitled Event'}</h3>
                    <span class="event-time">${event.startTime ? this.formatTime(event.startTime) : 'No start time'} - ${event.endTime ? this.formatTime(event.endTime) : 'No end time'}</span>
                </div>
            `;
            
            let eventDetailsHTML = '<div class="event-details">';
            if (event.room) {
                eventDetailsHTML += `<div class="event-room"><strong>Room:</strong> ${event.room}</div>`;
            }
            if (event.location && event.location !== event.room) {
                eventDetailsHTML += `<div class="event-location"><strong>Location:</strong> ${event.location}</div>`;
            }
            if (event.description) {
                eventDetailsHTML += `<div class="event-description"><strong>Description:</strong> ${event.description}</div>`;
            }
            if (event.organizer) {
                eventDetailsHTML += `<div class="event-organizer"><strong>Organizer:</strong> ${event.organizer}</div>`;
            }
            eventDetailsHTML += '</div>';
            
            eventDiv.innerHTML = eventHeaderHTML + eventDetailsHTML;
            eventDiv.addEventListener('click', () => this.showEventDetails(event));
            this.eventsList.appendChild(eventDiv);
        });
        
        console.log('List view rendered with', events.length, 'events');
    }

    renderDebugInfo() {
        const debugData = this.parser.getDebugInfo();
        
        this.debugInfo.innerHTML = `
            <div class="debug-section">
                <h3>Parser Summary</h3>
                <p><strong>Total Events:</strong> ${debugData.totalEvents}</p>
                <p><strong>Rooms Found:</strong> ${debugData.rooms.length}</p>
                <p><strong>Room List:</strong> ${debugData.rooms.join(', ') || 'None'}</p>
            </div>
            
            <div class="debug-section">
                <h3>Sample Events</h3>
                ${debugData.sampleEvents.map(event => `
                    <div class="debug-event">
                        <p><strong>Summary:</strong> ${event.summary}</p>
                        <p><strong>Location:</strong> ${event.location || 'Not specified'}</p>
                        <p><strong>Extracted Room:</strong> ${event.extractedRoom || 'None'}</p>
                        <p><strong>Time:</strong> ${event.startTime ? this.formatTime(event.startTime) : 'Not specified'} - ${event.endTime ? this.formatTime(event.endTime) : 'Not specified'}</p>
                        <hr>
                    </div>
                `).join('')}
            </div>
            
            <div class="debug-section">
                <h3>Room Availability for ${this.currentDate.toDateString()}</h3>
                <div class="availability-summary">
                    ${Object.entries(this.getRoomAvailabilitySummary()).map(([room, info]) => `
                        <p><strong>${room}:</strong> ${info.events} events, ${info.busyHours} hours busy</p>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RoomDashboard();
});