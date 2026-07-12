import Maintenance from "../models/Maintenance.js";
import Vehicle from "../models/Vehicle.js";

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
export const getAllMaintenances = async (req, res) => {
  try {
    const maintenance = await Maintenance.find()
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: maintenance.length,
      maintenances: maintenance, // Keep plural matching frontend expectations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single maintenance record
// @route   GET /api/maintenance/:id
// @access  Private
export const getMaintenanceById = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id)
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate("createdBy", "fullName email");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    return res.status(200).json({
      success: true,
      maintenance: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create maintenance record
// @route   POST /api/maintenance
// @access  Private
export const createMaintenance = async (req, res) => {
  try {
    const { vehicle } = req.body;

    // Check if vehicle exists
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const record = await Maintenance.create({
      ...req.body,
      createdBy: req.user.id,
    });

    // Optionally update vehicle status to Maintenance
    await Vehicle.findByIdAndUpdate(vehicle, { status: "Maintenance" });

    const populated = await Maintenance.findById(record._id)
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate("createdBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Maintenance record created successfully",
      maintenance: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private
export const updateMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    const updatedRecord = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate("createdBy", "fullName email");

    // If status updated to Completed, update vehicle status back to Available
    if (req.body.status === "Completed") {
      await Vehicle.findByIdAndUpdate(record.vehicle, { status: "Available" });
    }

    return res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully",
      maintenance: updatedRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Complete maintenance record
// @route   PATCH /api/maintenance/:id/complete
// @access  Private
export const completeMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    const updatedRecord = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        status: "Completed",
        endDate: new Date(),
      },
      { new: true }
    )
      .populate("vehicle", "vehicleNumber vehicleType manufacturer model")
      .populate("createdBy", "fullName email");

    // Update vehicle status back to Available
    await Vehicle.findByIdAndUpdate(record.vehicle, { status: "Available" });

    return res.status(200).json({
      success: true,
      message: "Maintenance marked as completed",
      maintenance: updatedRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private
export const deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    // If deleting a pending/in progress maintenance, set vehicle back to Available
    if (record.status !== "Completed") {
      await Vehicle.findByIdAndUpdate(record.vehicle, { status: "Available" });
    }

    await record.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
