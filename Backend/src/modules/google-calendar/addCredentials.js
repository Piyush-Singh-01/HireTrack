import User from "../users/user.model.js";

const addCredentials = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const creatorRole = req.user.Role;
    const companyCode = req.user.companyCode;
    const { clientid, clientsecret } = req.body;

    const permissions = {
      SuperAdmin: ["Admin", "Interviewer"],
      Admin: ["Interviewer"],
    };

    if (!permissions[creatorRole]) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You do not have permission to create users",
        });
    }

    if (!clientid || !clientsecret) {
      return res.json({
        error: "ClientId aand ClientSecret is required to Add Credentials.",
      });
    }

    const user = await User.findOne({
      _id: req.user.id,
      companyCode,
      role: "SuperAdmin",
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in Database." });
    }

    user.googleCalendar.clientId = clientid;
    user.googleCalendar.clientSecret = clientsecret;

    await user.save();

    res.json({
      success: true,
      message: "Google Calendar credentials saved successfully",
      data: user.googleCalendar,
    });
  } catch (err) {
    console.error("Create User Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export default addCredentials;
