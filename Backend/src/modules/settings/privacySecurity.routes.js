import express from "express";
import { verify2FA, enable2FA, disable2FA } from "./twoFactorController.js";
import changePassword from "./changePasswordController.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

const router = express.Router();

router.post("/change-password", protect, allAccess, changePassword);

// ===== 2FA =====
router.post("/enable-2fa", protect, allAccess, enable2FA);
router.post("/verify-2fa", protect, allAccess, verify2FA);
router.post("/disable-2fa", protect, allAccess, disable2FA);

export default router;

