import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Vehicle from "../models/Vehicle.js";
import Maintenance from "../models/Maintenance.js";
import FuelLog from "../models/FuelLog.js";
import ActivityLog from "../models/ActivityLog.js";

// Helper to log administrative actions
const logAdminAction = async (action, details, performedBy, targetUser = null) => {
  try {
    await ActivityLog.create({
      action,
      details,
      performedBy,
      targetUser,
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};

// @desc    Get all users (paginated, filtered, searchable)
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (role && role !== "All") {
      query.role = role;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    // Stats calculations for user management page
    const totalCount = await User.countDocuments();
    const activeCount = await User.countDocuments({ status: "Active" });
    const adminCount = await User.countDocuments({ role: "Admin" });
    const managerCount = await User.countDocuments({ role: "Fleet Manager" });
    const driverCount = await User.countDocuments({ role: "Driver" });
    const safetyCount = await User.countDocuments({ role: "Safety Officer" });
    const analystCount = await User.countDocuments({ role: "Financial Analyst" });

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      users,
      stats: {
        total: totalCount,
        active: activeCount,
        Admin: adminCount,
        "Fleet Manager": managerCount,
        Driver: driverCount,
        "Safety Officer": safetyCount,
        "Financial Analyst": analystCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get detailed user profile and relations for profile drawer
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let trips = [];
    let assignedVehicle = null;
    let maintenances = [];
    let fuelLogs = [];

    // If driver, fetch assignments and metrics
    if (user.role === "Driver") {
      trips = await Trip.find({ driver: user._id })
        .populate("vehicle", "vehicleNumber manufacturer model")
        .sort({ departureTime: -1 })
        .limit(5);

      assignedVehicle = await Vehicle.findOne({ assignedDriver: user._id });

      if (assignedVehicle) {
        maintenances = await Maintenance.find({ vehicle: assignedVehicle._id })
          .sort({ startDate: -1 })
          .limit(5);
      }

      fuelLogs = await FuelLog.find({ createdBy: user._id })
        .populate("vehicle", "vehicleNumber")
        .sort({ date: -1 })
        .limit(5);
    } else {
      // General logs logged by this admin/manager/analyst
      fuelLogs = await FuelLog.find({ createdBy: user._id })
        .populate("vehicle", "vehicleNumber")
        .sort({ date: -1 })
        .limit(5);
    }

    return res.status(200).json({
      success: true,
      user,
      relations: {
        trips,
        assignedVehicle,
        maintenances,
        fuelLogs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new user profile
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, status } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: role || "Driver",
      status: status || "Active",
    });

    await logAdminAction(
      "User Created",
      `New user ${user.fullName} created with role ${user.role}.`,
      req.user.id,
      user._id
    );

    const responseUser = user.toObject();
    delete responseUser.password;

    return res.status(201).json({
      success: true,
      message: "User account created successfully",
      user: responseUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile or password
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { fullName, phone, status, role, password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Role safety warning: don't lock yourself out of Admin role
    if (user._id.toString() === req.user.id && role && role !== "Admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own Admin role",
      });
    }

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (status) {
      if (user._id.toString() === req.user.id && status === "Inactive") {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own account",
        });
      }
      user.status = status;
    }
    if (role) user.role = role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
      await logAdminAction("Password Reset", `Password reset performed for ${user.fullName}.`, req.user.id, user._id);
    }

    await user.save();

    await logAdminAction(
      "User Modified",
      `User profile values updated for ${user.fullName}.`,
      req.user.id,
      user._id
    );

    const responseUser = user.toObject();
    delete responseUser.password;

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: responseUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Patch role update specifically with confirmation audits
// @route   PATCH /api/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user.id && role !== "Admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot demote yourself from Admin",
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAdminAction(
      "Role Changed",
      `Changed ${user.fullName}'s role from ${oldRole} to ${role}.`,
      req.user.id,
      user._id
    );

    return res.status(200).json({
      success: true,
      message: `Role updated to ${role} successfully`,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Patch status updates
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user.id && status === "Inactive") {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own Admin profile",
      });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    await logAdminAction(
      "User Deactivated",
      `Changed ${user.fullName}'s status from ${oldStatus} to ${status}.`,
      req.user.id,
      user._id
    );

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status} successfully`,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAdminAction(
      "User Deleted",
      `Deleted account for ${user.fullName} (${user.email}).`,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admin activity log timeline
// @route   GET /api/users/activities/log
// @access  Private (Admin only)
export const getUserActivities = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("performedBy", "fullName email")
      .populate("targetUser", "fullName email")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
