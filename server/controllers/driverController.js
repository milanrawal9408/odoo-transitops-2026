import Driver from "../models/Driver.js";
import User from "../models/User.js";

export const createDriver = async (req, res) => {
  try {
    const {
      user,
      licenseNumber,
      licenseExpiry,
      address,
      dateOfBirth,
      joiningDate,
      experience,
      emergencyContactName,
      emergencyContactPhone,
      remarks,
    } = req.body;

    // Ensure the referenced user exists and has Driver role
    const userDoc = await User.findById(user);
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if driver profile already exists for this user
    const existingDriver = await Driver.findOne({ user });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Driver profile already exists for this user",
      });
    }

    // Check license uniqueness
    const existingLicense = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: "A driver with this license number already exists",
      });
    }

    const driver = await Driver.create({
      user,
      licenseNumber,
      licenseExpiry,
      address,
      dateOfBirth,
      joiningDate,
      experience,
      emergencyContactName,
      emergencyContactPhone,
      remarks,
      createdBy: req.user.id,
    });

    const populated = await Driver.findById(driver._id)
      .populate("user", "fullName email phone role status")
      .populate("assignedVehicle", "vehicleNumber vehicleType");

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      driver: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("user", "fullName email phone role status")
      .populate("assignedVehicle", "vehicleNumber vehicleType")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate("user", "fullName email phone role status")
      .populate("assignedVehicle", "vehicleNumber vehicleType")
      .populate("createdBy", "fullName email");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Prevent changing user reference
    const { user, createdBy, ...updateData } = req.body;

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "fullName email phone role status")
      .populate("assignedVehicle", "vehicleNumber vehicleType");

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    await driver.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all users with role=Driver (for dropdown when creating driver profile)
export const getDriverUsers = async (req, res) => {
  try {
    // Get users with Driver role that don't already have a Driver profile
    const existingDriverUserIds = await Driver.distinct("user");

    const users = await User.find({
      role: "Driver",
      _id: { $nin: existingDriverUserIds },
    }).select("fullName email phone");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
