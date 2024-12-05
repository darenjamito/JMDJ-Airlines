import mongoose from "mongoose";
const { Schema, model } = mongoose;

const flightSchema = new Schema({
    Flight_Code: {
        type: String,
        required: true,
    },
    Depart: {
        type: String,
        required: true,
    },
    Depart_Date: {
        type: String,
        required: true,
    },
    Depart_Time: {
        type: String,
        required: true,
    },
    Arrival: {
        type: String,
        required: true,
    },
    Arrival_Date: {
        type: String,
        required: true,
    },
    Arrival_Time: {
        type: String,
        required: true,
    },
    Flight_Duration: {
        type: String,
        required: true,
    },
    Ticket_Price: {
        type: String,
        required: true,
    },
});

const Flight = model("Flight", flightSchema);
export default Flight;