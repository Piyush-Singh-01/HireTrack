import notifications from "../dashboards/dashboardNotification.model.js";

const updateAllNotifications = async (req, res) => {
  try {
    const { type } = req.query;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    let filter = { companyCode };

    // Apply filter only if not "all"
    if (type && type !== "all") {
      filter.type = type;
    }

    const result = await notifications.updateMany(
      filter,
      { isSeen: true }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as seen",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
    });
  }
};

export default updateAllNotifications;
