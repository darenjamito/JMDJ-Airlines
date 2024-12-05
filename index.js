import express from "express";

// const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

import mongoose from "mongoose";
import Flight from "./model/Flight.js";
import User from "./model/User.js";
import Booking from "./model/Booking.js"; // Import Booking model
import bcrypt from 'bcrypt';
import session from 'express-session';

// Define admin username
const isAdminUser = (username) => username.toLowerCase() === 'admin';

app.use(session({
    secret: 'JMDJ-Airlines-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

mongoose.connect("mongodb+srv://admin:admin@cluster0.o6ov2.mongodb.net/JMDJ-Airlines?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('Successfully connected to MongoDB.');
        // Let's check if we can count documents
        return Flight.countDocuments();
    })
    .then(count => {
        console.log(`Number of flights in database: ${count}`);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

import path from "path";
import { fileURLToPath } from 'url';
    
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render("Home Page");
});

app.get('/signup', (req, res) => {
    res.render("Sign Up");
});

app.post('/api/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, username, password } = req.body;

        // Check if username already exists
        const existingUsername = await User.findOne({ username: username });
        if (existingUsername) {
            return res.status(400).json({ 
                error: 'username_exists',
                message: 'Username already exists' 
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) {
            return res.status(400).json({ 
                error: 'email_exists',
                message: 'Email already exists' 
            });
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'invalid_email',
                message: 'Invalid email address' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword
        });

        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.get('/login', (req, res) => {
    res.render("Login");
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check if user is admin
        const isAdmin = isAdminUser(username);

        // Set user session
        req.session.user = {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: isAdmin
        };

        // Send success response with user info
        res.json({
            message: 'Login successful',
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: isAdmin
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware to check if user is authenticated and is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && isAdminUser(req.session.user.username)) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware to check if user is authenticated and is a regular user
const isUser = (req, res, next) => {
    if (req.session.user && !isAdminUser(req.session.user.username)) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/singapore-flights', (req, res) => {
    res.render("Singapore Flights");
});

app.get('/cebu-flights', (req, res) => {
    res.render("Cebu Flights");
});

app.get('/manila-flights', (req, res) => {
    res.render("Manila Flights");
});

app.get('/flight-selection', async (req, res) => {
    try {
        const { from, to, departDate } = req.query;

        // Find flights matching the from, to, and formatted_date criteria
        const flights = await Flight.find({
            Depart: from,
            Arrival: to,
            Depart_Date: departDate
        }).exec();

        // If no flights are found, redirect to No Flights page
        if (!flights || flights.length === 0) {
            return res.render("No Flights", { from, to, departDate });
        }

        // If flights are found, render Flight Selection page as normal
        res.render("Flight Selection", { from, to, flights, departDate });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching flights.");
    }
});

app.get('/seat-selection', (req, res) => {
    const { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice } = req.query;
    res.render("Seat Selection", { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice });
});

app.get('/baggage-selection', (req, res) => {
    const { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice, seat } = req.query;
    res.render("Baggage Add-ons", { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice, seat });
});

app.get('/user-details', (req, res) => {
    const { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice, seat, baggage } = req.query;
    res.render("User Details", { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice, seat, baggage });
});

app.get('/payment', (req, res) => {
    const { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice, seat, baggage, title, firstName, middleInitial, lastName, nationality, birthdate, contactNumber, email } = req.query;
    res.render("Payment", { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice, seat, baggage, title, firstName, middleInitial, lastName, nationality, birthdate, contactNumber, email });
});

app.get('/booking-confirmation', async (req, res) => {
    const { from, to, flightCode, depart, departDate, departTime, arrival, arrivalDate, arrivalTime, flightDuration, ticketPrice, seat, baggage, title, firstName, middleInitial, lastName, nationality, birthdate, contactNumber, email, cardHolder, cardNumber, expiryDate, cvc } = req.query;

    try {
        // Create new booking document
        const newBooking = new Booking({
            flightCode,
            from,
            to,
            departDate,
            departTime,
            arrivalDate,
            arrivalTime,
            seat,
            baggage,
            title,
            firstName,
            middleInitial,
            lastName,
            nationality,
            birthdate,
            contactNumber,
            email,
            ticketPrice: ticketPrice.toString(),
            bookingDate: new Date().toISOString()
        });

        // Save the booking to get the _id
        await newBooking.save();

        // Get current date in the format: Month DD, YYYY
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        res.render("Booking Confirmation", { 
            from, to, flightCode, depart, departDate, departTime, 
            arrival, arrivalDate, arrivalTime, flightDuration, 
            ticketPrice, seat, baggage, title, firstName, middleInitial, 
            lastName, nationality, birthdate, contactNumber, email, 
            cardHolder, cardNumber, expiryDate, cvc, currentDate,
            bookingReference: newBooking._id.toString()
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).send('Error processing your booking');
    }
});

app.get('/admin/dashboard', isAdmin, async (req, res) => {
    try {
        const totalFlights = await Flight.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate total revenue from confirmed bookings
        const bookings = await Booking.find({ status: 'Confirmed' });
        const totalRevenue = bookings.reduce((sum, booking) => {
            if (booking.ticketPrice) {
                // Remove "PHP " prefix, commas, and convert to number
                const priceStr = booking.ticketPrice.replace(/[^\d.]/g, '');
                const price = parseFloat(priceStr);
                return sum + (isNaN(price) ? 0 : price);
            }
            return sum;
        }, 0);

        // Fetch 5 most recent bookings
        const recentBookings = await Booking.find()
            .sort({ bookingDate: -1 })
            .limit(5);

        // Format the bookings data
        const formattedBookings = recentBookings.map(booking => ({
            bookingId: booking._id.toString(),
            passengerName: `${booking.title} ${booking.firstName} ${booking.lastName}`,
            flightDetails: `${booking.from} to ${booking.to} - ${booking.flightCode} (${booking.departDate})`,
            status: booking.status
        }));

        res.render('Admin Dashboard', {
            totalFlights,
            totalBookings,
            totalUsers,
            totalRevenue,
            recentBookings: formattedBookings
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.status(500).send('Error loading admin dashboard');
    }
});

// Add the Users page route
app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.render('Users', { users });
    } catch (error) {
        console.error('Error loading users page:', error);
        res.status(500).send('Error loading users page');
    }
});

// Admin flight search route
app.get('/admin/flights', isAdmin, async (req, res) => {
    try {
        const { from, to, date } = req.query;
        
        // Check if any search parameters are provided
        const isSearching = from || to || date;
        
        if (isSearching) {
            // Build the query object for search
            let query = {};
            if (from) query.Depart = from;
            if (to) query.Arrival = to;
            if (date) {
                query.Depart_Date = req.query.departDate;
            }

            // Find flights matching the search criteria
            const flights = await Flight.find(query);
            
            // Sort flights with custom sorting function
            flights.sort((a, b) => {
                // Parse dates (format: "Day, DD Mon")
                const dateA = new Date(a.Depart_Date + " 2023");
                const dateB = new Date(b.Depart_Date + " 2023");
                
                if (dateA - dateB !== 0) return dateA - dateB;
                
                // If dates are equal, compare times
                if (a.Depart_Time !== b.Depart_Time) return a.Depart_Time.localeCompare(b.Depart_Time);
                
                // If times are equal, compare departure locations
                if (a.Depart !== b.Depart) return a.Depart.localeCompare(b.Depart);
                
                // Finally, compare arrival locations
                return a.Arrival.localeCompare(b.Arrival);
            });

            res.render('Admin List of Flights', { 
                flights,
                searchParams: { from, to, date },
                isSearchResults: true
            });
        } else {
            // No search parameters - show all flights
            const flights = await Flight.find({});
            
            // Sort flights with the same custom sorting function
            flights.sort((a, b) => {
                // Parse dates (format: "Day, DD Mon")
                const dateA = new Date(a.Depart_Date + " 2023");
                const dateB = new Date(b.Depart_Date + " 2023");
                
                if (dateA - dateB !== 0) return dateA - dateB;
                
                // If dates are equal, compare times
                if (a.Depart_Time !== b.Depart_Time) return a.Depart_Time.localeCompare(b.Depart_Time);
                
                // If times are equal, compare departure locations
                if (a.Depart !== b.Depart) return a.Depart.localeCompare(b.Depart);
                
                // Finally, compare arrival locations
                return a.Arrival.localeCompare(b.Arrival);
            });

            res.render('Admin List of Flights', { 
                flights,
                searchParams: {},
                isSearchResults: false
            });
        }
    } catch (error) {
        console.error('Error handling flights:', error);
        res.status(500).send('Error handling flights');
    }
});

app.get('/admin/flights/add', isAdmin, (req, res) => {
    res.render('Admin Add Flight');
});

// Add flight endpoint
app.post('/api/flights/add', isAdmin, async (req, res) => {
    try {
        const {
            Flight_Code,
            Depart,
            Depart_Date,
            Depart_Time,
            Arrival,
            Arrival_Date,
            Arrival_Time,
            Flight_Duration,
            Ticket_Price
        } = req.body;

        // Validate required fields
        if (!Flight_Code || !Depart || !Depart_Date || !Depart_Time || 
            !Arrival || !Arrival_Date || !Arrival_Time || !Flight_Duration || !Ticket_Price) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new flight
        const newFlight = new Flight({
            Flight_Code,
            Depart,
            Depart_Date,
            Depart_Time,
            Arrival,
            Arrival_Date,
            Arrival_Time,
            Flight_Duration,
            Ticket_Price
        });

        await newFlight.save();
        res.status(201).json({ message: 'Flight added successfully' });
    } catch (error) {
        console.error('Error adding flight:', error);
        res.status(500).json({ message: 'Error adding flight' });
    }
});

// Update flight route
app.put('/api/flights/:flightNumber', isAdmin, async (req, res) => {
    try {
        const { flightNumber } = req.params;
        const {
            departure,
            arrival,
            departDate,
            arrivalDate,
            departureTime,
            arrivalTime,
            duration,
            price
        } = req.body;

        const flight = await Flight.findOne({ Flight_Code: flightNumber });
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        // Update flight details
        flight.Depart = departure;
        flight.Arrival = arrival;
        flight.Depart_Date = departDate;
        flight.Arrival_Date = arrivalDate;
        flight.Depart_Time = departureTime;
        flight.Arrival_Time = arrivalTime;
        flight.Flight_Duration = duration;
        flight.Ticket_Price = price;

        await flight.save();
        res.json({ message: 'Flight updated successfully' });
    } catch (error) {
        console.error('Error updating flight:', error);
        res.status(500).json({ message: 'Error updating flight' });
    }
});

// Delete flight endpoint
app.delete('/admin/flights/:id', isAdmin, async (req, res) => {
    try {
        const flightId = req.params.id;
        const result = await Flight.findByIdAndDelete(flightId);
        
        if (!result) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        
        res.status(200).json({ message: 'Flight deleted successfully' });
    } catch (error) {
        console.error('Error deleting flight:', error);
        res.status(500).json({ message: 'Error deleting flight' });
    }
});

// Delete flight route
app.delete('/api/flights/:flightId', isAdmin, async (req, res) => {
    try {
        const flightId = req.params.flightId;
        const deletedFlight = await Flight.findByIdAndDelete(flightId);
        
        if (!deletedFlight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        
        res.json({ message: 'Flight deleted successfully' });
    } catch (error) {
        console.error('Error deleting flight:', error);
        res.status(500).json({ message: 'Error deleting flight' });
    }
});

// Add the bookings route
app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.render('Bookings', { bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});

// Add the admin bookings route
app.get('/admin/bookings', isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 });
        res.render('Bookings', { bookings, isAdmin: true });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});

// Delete user endpoint
app.delete('/api/users/:userId', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find and delete the user
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get user details endpoint
app.get('/api/users/:userId', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send user data without password
        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username
        };
        
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// Update user endpoint
app.put('/api/users/:userId', isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already in use
        if (email !== user.email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({ 
                    error: 'email_exists',
                    message: 'Email already exists' 
                });
            }
        }

        // Update user details
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;

        await user.save();
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect('/');
    });
});

// User dashboard route
app.get('/user/dashboard', isUser, async (req, res) => {
    try {
        // Get complete user data
        const userData = await User.findById(req.session.user.id);

        // Get user's bookings
        const recentBookings = await Booking.find({ userId: req.session.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get user's statistics
        const totalBookings = await Booking.countDocuments({ userId: req.session.user.id });
        const totalFlights = await Booking.countDocuments({ 
            userId: req.session.user.id,
            status: 'completed'
        });

        res.render('User Dashboard', {
            user: userData,
            recentBookings,
            totalBookings,
            totalFlights
        });
    } catch (error) {
        console.error('Error loading user dashboard:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// Flight History route
app.get('/user/flight-history', isUser, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.session.user.id })
            .sort({ createdAt: -1 });

        res.render('Flight History', {
            user: req.session.user,
            bookings: bookings
        });
    } catch (error) {
        console.error('Error loading flight history:', error);
        res.status(500).send('Error loading flight history');
    }
});

// Edit Profile route
app.get('/user/edit-profile', isUser, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('Edit Profile', { user: user });
    } catch (error) {
        console.error('Error loading profile:', error);
        res.status(500).send('Error loading profile');
    }
});

// Update Profile route
app.post('/user/update-profile', isUser, async (req, res) => {
    try {
        const { firstName, lastName, email, username, currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.session.user.id);
        
        // Verify current password if provided
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).send('Current password is incorrect');
            }
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        // Update user information
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.username = username;

        await user.save();

        // Update session data
        req.session.user = {
            ...req.session.user,
            firstName,
            lastName,
            email,
            username
        };

        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Error updating profile');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});