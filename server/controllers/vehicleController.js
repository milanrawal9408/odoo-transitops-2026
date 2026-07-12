import Vehicle from "../models/Vehicle.js";

export const createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      manufacturer,
      model,
      manufacturingYear,
      fuelType,
      capacity,
      insuranceExpiry,
      pollutionExpiry,
      registrationExpiry,
    } = req.body;

    const existingVehicle = await Vehicle.findOne({ vehicleNumber });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle already exists",
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      vehicleType,
      manufacturer,
      model,
      manufacturingYear,
      fuelType,
      capacity,
      insuranceExpiry,
      pollutionExpiry,
      registrationExpiry,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === "Driver") {
      query.assignedDriver = req.user.id;
    }

    const vehicles = await Vehicle.find(query)
      .populate("createdBy", "fullName email")
      .populate("assignedDriver", "fullName email");

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("assignedDriver", "fullName email");

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // RBAC check: Drivers can only view their own assigned vehicle
    if (req.user.role === "Driver" && vehicle.assignedDriver?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only view your assigned vehicle",
      });
    }

    return res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    await vehicle.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};