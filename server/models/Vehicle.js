import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    vehicleType: {
      type: String,
      required: true,
      enum: ["Truck", "Van", "Bus", "Car", "Bike", "Other"],
    },

    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    manufacturingYear: {
      type: Number,
      required: true,
    },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "CNG", "Electric"],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "On Trip",
        "Maintenance",
        "Out of Service"
      ],
      default: "Available",
    },

    assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},

    odometerReading: {
      type: Number,
      default: 0,
    },

    insuranceExpiry: {
      type: Date,
    },

    pollutionExpiry: {
      type: Date,
    },

    registrationExpiry: {
      type: Date,
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

export default mongoose.model("Vehicle", vehicleSchema);