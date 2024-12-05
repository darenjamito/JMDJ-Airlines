import mongoose from "mongoose";
const { Schema, model } = mongoose;

const bookingSchema = new Schema({
    flightCode: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    departDate: {
        type: String,
        required: true,
    },
    departTime: {
        type: String,
        required: true,
    },
    arrivalDate: {
        type: String,
        required: true,
    },
    arrivalTime: {
        type: String,
        required: true,
    },
    seat: {
        type: String,
        required: true,
    },
    baggage: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    middleInitial: String,
    lastName: {
        type: String,
        required: true,
    },
    nationality: {
        type: String,
        required: true,
    },
    birthdate: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Cancelled'],
        default: 'Confirmed'
    },
    bookingDate: {
        type: String,
        default: () => new Date().toISOString()
    },
    ticketPrice: {
        type: String,
        required: true
    }
});

const Booking = model("Booking", bookingSchema);
export default Booking;
