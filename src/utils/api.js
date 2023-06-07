import { POAP_API_URL } from './constants';

// Function to register a new user
export async function registerUser(userData) {
    try {
        const response = await fetch(`${POAP_API_URL}/api/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Registration successful, perform any necessary actions
        } else {
            // Registration failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to log in an existing user
export async function loginUser(credentials) {
    try {
        const response = await fetch(`${POAP_API_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Login successful, perform any necessary actions
        } else {
            // Login failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to log out a user
export async function logoutUser() {
    try {
        const response = await fetch(`${POAP_API_URL}/api/auth/logout`, {
            method: 'POST',
        });

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Logout successful, perform any necessary actions
        } else {
            // Logout failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to create a new event
export async function createEvent(eventData) {
    try {
        const response = await fetch(`${POAP_API_URL}/api/events`, {
            method: 'POST',
            body: JSON.stringify(eventData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Event creation successful, perform any necessary actions
            // Retrieve the newly created event ID from data.eventId
        } else {
            // Event creation failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to get event details
export async function getEvent(eventId) {
    try {
        const response = await fetch(`${POAP_API_URL}/api/events/${eventId}`);

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Event details retrieved successfully, perform any necessary actions
        } else {
            // Failed to retrieve event details, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to update event details
export async function updateEvent(eventId, eventData) {
    try {
        const response = await fetch(`${POAP_API_URL}/api/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Event update successful, perform any necessary actions
        } else {
            // Event update failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to delete an event
export async function deleteEvent(eventId) {
    try {
        const response = await fetch(`${POAP_API_URL}/api/events/${eventId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Event deletion successful, perform any necessary actions
        } else {
            // Event deletion failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to register attendance for an event
export async function registerAttendance(eventId) {
    try {
        const response = await fetch(
            `${POAP_API_URL}/api/events/${eventId}/attendance`,
            {
                method: 'POST',
            }
        );

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Attendance registration successful, perform any necessary actions
        } else {
            // Attendance registration failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to get attendee details
export async function getAttendee(attendeeId) {
    try {
        const response = await fetch(
            `${POAP_API_URL}/api/attendees/${attendeeId}`
        );

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Attendee details retrieved successfully, perform any necessary actions
        } else {
            // Failed to retrieve attendee details, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to update attendee details
export async function updateAttendee(attendeeId, attendeeData) {
    try {
        const response = await fetch(
            `${POAP_API_URL}/api/attendees/${attendeeId}`,
            {
                method: 'PUT',
                body: JSON.stringify(attendeeData),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Attendee update successful, perform any necessary actions
        } else {
            // Attendee update failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}

// Function to cancel attendance for an event
export async function cancelAttendance(attendeeId) {
    try {
        const response = await fetch(
            `${POAP_API_URL}/api/attendees/${attendeeId}`,
            {
                method: 'DELETE',
            }
        );

        const data = await response.json();

        console.log(data);

        // Process the response data
        if (response.ok) {
            // Attendance cancellation successful, perform any necessary actions
        } else {
            // Attendance cancellation failed, handle the error message in data.error
        }
    } catch (error) {
        // Handle network or other errors
    }
}
