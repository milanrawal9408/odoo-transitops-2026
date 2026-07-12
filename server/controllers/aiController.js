import Vehicle from "../models/Vehicle.js";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import Maintenance from "../models/Maintenance.js";

// Call OpenRouter API via native fetch
const callOpenRouter = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined in environment variables");
  }

  const url = "https://openrouter.ai/api/v1/chat/completions";
  // Default to Gemini 2.5 Flash on OpenRouter
  const modelName = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "TransitOps ERP",
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API call failed: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
};

// Classify query intent using OpenRouter
const classifyIntent = async (query) => {
  const classificationPrompt = `
You are an intent classification engine for a Fleet Management ERP.
Classify the user's question into exactly one of the following intent keys, or respond with "other" if none match:

- vehicles_under_maintenance (e.g. "Which vehicles are in maintenance?", "show cars in shop")
- today_trips (e.g. "Show today's trips", "what trips do we have today?")
- driver_most_trips (e.g. "Which driver completed the most trips?", "top driver")
- insurance_expiring_soon (e.g. "Vehicles with insurance expiring soon", "insurance expiry")
- monthly_maintenance_expenses (e.g. "Monthly maintenance expenses", "how much did we spend on maintenance this month?")
- fuel_expenses (e.g. "Fuel expenses", "how much did we spend on fuel?")
- fleet_summary (e.g. "Fleet summary", "overview of fleet")
- active_trips (e.g. "Active trips", "trips currently running")
- available_vehicles (e.g. "Available vehicles", "what vehicles are free?")
- pending_maintenance (e.g. "Pending maintenance", "maintenance records not started")
- highest_maintenance_cost (e.g. "Highest maintenance cost", "most expensive repair")
- fleet_health_summary (e.g. "Fleet health summary", "health overview")

Respond with ONLY the lowercase key (e.g. "fleet_summary") and absolutely nothing else. No markdown, no punctuation.

User query: "${query}"
`;

  try {
    const messages = [{ role: "user", content: classificationPrompt }];
    const textResult = await callOpenRouter(messages);
    const resolved = textResult.trim().toLowerCase();
    return resolved;
  } catch (error) {
    console.error("Intent classification failed, defaulting to other:", error.message);
    return "other";
  }
};

// Retrieve context data from DB based on classified intent
const getDatabaseContext = async (intent) => {
  switch (intent) {
    case "vehicles_under_maintenance": {
      const vehicles = await Vehicle.find({ status: "Maintenance" })
        .select("vehicleNumber vehicleType manufacturer model odometerReading");
      return { vehicles };
    }

    case "today_trips": {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const trips = await Trip.find({ departureTime: { $gte: start, $lte: end } })
        .populate("vehicle", "vehicleNumber")
        .populate("driver", "fullName");
      return { trips };
    }

    case "driver_most_trips": {
      const driverCounts = await Trip.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: "$driver", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);
      if (driverCounts.length > 0) {
        const topDriverUser = await User.findById(driverCounts[0]._id).select("fullName email");
        return {
          topDriver: {
            fullName: topDriverUser?.fullName || "Unknown",
            email: topDriverUser?.email || "",
            tripCount: driverCounts[0].count
          }
        };
      }
      return { topDriver: null };
    }

    case "insurance_expiring_soon": {
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      const vehicles = await Vehicle.find({ insuranceExpiry: { $lte: thirtyDays } })
        .select("vehicleNumber manufacturer model insuranceExpiry");
      return { vehicles };
    }

    case "monthly_maintenance_expenses": {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const records = await Maintenance.find({ startDate: { $gte: startOfMonth } }).select("cost maintenanceType");
      const total = records.reduce((sum, r) => sum + (r.cost || 0), 0);
      return { totalExpenses: total, recordsCount: records.length };
    }

    case "fuel_expenses": {
      const logs = await FuelLog.find().select("cost liters");
      const totalCost = logs.reduce((sum, r) => sum + (r.cost || 0), 0);
      const totalLiters = logs.reduce((sum, r) => sum + (r.liters || 0), 0);
      return { totalCost, totalLiters, logsCount: logs.length };
    }

    case "fleet_summary": {
      const vehiclesCount = await Vehicle.countDocuments();
      const driversCount = await User.countDocuments({ role: "Driver" });
      const activeTripsCount = await Trip.countDocuments({ status: "In Progress" });
      const maintenanceCount = await Vehicle.countDocuments({ status: "Maintenance" });
      return { vehiclesCount, driversCount, activeTripsCount, maintenanceCount };
    }

    case "active_trips": {
      const trips = await Trip.find({ status: "In Progress" })
        .populate("vehicle", "vehicleNumber")
        .populate("driver", "fullName");
      return { trips };
    }

    case "available_vehicles": {
      const vehicles = await Vehicle.find({ status: "Available" })
        .select("vehicleNumber vehicleType manufacturer model");
      return { vehicles };
    }

    case "pending_maintenance": {
      const records = await Maintenance.find({ status: "Pending" })
        .populate("vehicle", "vehicleNumber");
      return { records };
    }

    case "highest_maintenance_cost": {
      const records = await Maintenance.find()
        .sort({ cost: -1 })
        .limit(1)
        .populate("vehicle", "vehicleNumber");
      return { record: records[0] || null };
    }

    case "fleet_health_summary": {
      const totalVehicles = await Vehicle.countDocuments();
      const available = await Vehicle.countDocuments({ status: "Available" });
      const maintenance = await Vehicle.countDocuments({ status: "Maintenance" });
      const outOfService = await Vehicle.countDocuments({ status: "Out of Service" });
      return { totalVehicles, available, maintenance, outOfService };
    }

    default: {
      const totalVehicles = await Vehicle.countDocuments();
      const totalTrips = await Trip.countDocuments();
      return { totalVehicles, totalTrips };
    }
  }
};

// @desc    Process AI Chat message
// @route   POST /api/ai/chat
// @access  Private (Admin, Fleet Manager)
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // 1. Identify Intent
    const intent = await classifyIntent(message);

    // 2. Query MongoDB safely for relevant context
    const dbContext = await getDatabaseContext(intent);

    // 3. Assemble chat contents matching history structure (OpenAI Chat format)
    const messages = [];

    // Map history
    if (history && Array.isArray(history)) {
      history.forEach((h) => {
        messages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.text || h.message || "",
        });
      });
    }

    // Add current user message with prompt structure
    const systemPrompt = `
You are TransitOps AI, a professional ERP assistant for a Fleet Management system.
Answer the user query based ONLY on the following context fetched securely from our database:

Context Data:
${JSON.stringify(dbContext, null, 2)}

Identify matching records. Format numbers cleanly (e.g. currency in ₹, distance in km).
User Query: "${message}"
`;

    messages.push({
      role: "user",
      content: systemPrompt,
    });

    // 4. Invoke OpenRouter API
    const responseText = await callOpenRouter(messages);

    return res.status(200).json({
      success: true,
      reply: responseText,
      intent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
