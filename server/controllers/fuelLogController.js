import FuelLog from "../models/FuelLog.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";

// @desc    Get all fuel logs
// @route   GET /api/fuel
// @access  Private
export const getFuelLogs = async (req, res) => {
  try {
    const logs = await FuelLog.find()
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate({
        path: "driver",
        populate: { path: "user", select: "fullName email phone" },
      })
      .populate("createdBy", "fullName email")
      .sort({ fuelDate: -1 });

    return res.status(200).json({
      success: true,
      count: logs.length,
      fuelLogs: logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single fuel log
// @route   GET /api/fuel/:id
// @access  Private
export const getFuelLogById = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id)
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate({
        path: "driver",
        populate: { path: "user", select: "fullName email phone" },
      })
      .populate("createdBy", "fullName email");

    if (!log) {
      return res.status(404).json({ success: false, message: "Fuel log not found" });
    }

    return res.status(200).json({ success: true, fuelLog: log });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create fuel log
// @route   POST /api/fuel
// @access  Private
export const createFuelLog = async (req, res) => {
  try {
    const { vehicle, driver, quantity, pricePerLiter } = req.body;

    // Validate vehicle exists
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    // Validate driver exists
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    // Auto-calculate totalCost
    const totalCost = parseFloat((quantity * pricePerLiter).toFixed(2));

    const log = await FuelLog.create({
      ...req.body,
      totalCost,
      createdBy: req.user.id,
    });

    const populated = await FuelLog.findById(log._id)
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate({
        path: "driver",
        populate: { path: "user", select: "fullName email phone" },
      })
      .populate("createdBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Fuel log created successfully",
      fuelLog: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update fuel log
// @route   PUT /api/fuel/:id
// @access  Private
export const updateFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: "Fuel log not found" });
    }

    // Recalculate totalCost if quantity or pricePerLiter changed
    const quantity = req.body.quantity ?? log.quantity;
    const pricePerLiter = req.body.pricePerLiter ?? log.pricePerLiter;
    const totalCost = parseFloat((quantity * pricePerLiter).toFixed(2));

    const updated = await FuelLog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, totalCost },
      { new: true, runValidators: true }
    )
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate({
        path: "driver",
        populate: { path: "user", select: "fullName email phone" },
      })
      .populate("createdBy", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Fuel log updated successfully",
      fuelLog: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete fuel log
// @route   DELETE /api/fuel/:id
// @access  Private (Admin only)
export const deleteFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: "Fuel log not found" });
    }

    await log.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Fuel log deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
