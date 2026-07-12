import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    licenseExpiry: {
      type: Date,
      required: true,
    },

    address: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "On Trip",
        "Inactive",
        "Suspended",
      ],
      default: "Available",
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    emergencyContactName: {
      type: String,
      trim: true,
    },

    emergencyContactPhone: {
      type: String,
      trim: true,
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

export default mongoose.model("Driver", driverSchema);