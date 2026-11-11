// middlewares/checkSubscription.js
import User from "../../modules/users/user.model.js";

const checkSubscription = (requiredPack = null) => {
  return async (req, res, next) => {
    try {
      
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      // ✅ SuperAdmin bypass
      if (currentUser.role === "superadmin") {
        return next();
      }

      const subscription = currentUser.subscription;  // always admin's subscription

      if (!subscription || !subscription.isSubscribed) {
        return res.status(403).json({ success: false, message: "Access denied. Subscription required." });
      }

      if (requiredPack === "gold" && subscription.isrestricted) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Gold plan required for this feature.",
        });
      }

      next();
    } catch (error) {
      console.error("Error in checkSubscription middleware:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};


export default checkSubscription;

