import express from "express";
const Router = express.Router();

import registerController from "./registerController.js";
import loginController from "./loginController.js";
import verifyEmail from "./verifyEmailController.js";
import forgotPassword from "./forgotPassword.js";
import resetPassword from "./resetPasswordController.js";
import deactivateAccount from "../users/deactivate.js";
import deletePermanentlyAccount from "../users/deletePermanently.js";
import refreshTokenController from "./refreshTokenController.js";

Router.post("/register", registerController);
Router.post("/login", loginController);
Router.get("/verify-email/:token", verifyEmail);
Router.post("/forgot-password", forgotPassword);
Router.post("/reset-password", resetPassword);
Router.put("/deactivate",deactivateAccount)
Router.delete("/delete",deletePermanentlyAccount)
Router.post("/refresh-token", refreshTokenController);

export default Router;
