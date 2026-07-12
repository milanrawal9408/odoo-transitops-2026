import mongoose from "mongoose";

const fuelLogSchema = new mongoose.Schema(
    {
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },

        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true,
        },

        fuelType: {
            type: String,
            enum: ["Petrol", "Diesel", "CNG", "Electric"],
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
        },

        pricePerLiter: {
            type: Number,
            required: true,
            min: 0,
        },

        totalCost: {
            type: Number,
            required: true,
            min: 0,
        },

        odometerReading: {
            type: Number,
            required: true,
            min: 0,
        },

        fuelStation: {
            type: String,
            required: true,
            trim: true,
        },

        fuelDate: {
            type: Date,
            default: Date.now,
        },

        remarks: {
            type: String,
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("FuelLog", fuelLogSchema);