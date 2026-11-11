import express from "express";
const Router = express.Router();

import createUserAndRole from "./createController.js";
import getUsersAndRoles from "./getAllController.js";
import updateUserAndRole from "./updateController.js";
import deleteUserAndRole from "./deleteController.js";
import toggleUserStatus from "./accountstatusController.js";
import getHiringManagers from "./getHiringManagers.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";

Router.post("/create", protect, allAccess, createUserAndRole);
Router.get("/get", protect, allAccess, getUsersAndRoles);
Router.get("/all-Users", protect, allAccess, getUsersAndRoles);
Router.put("/update/:id", protect, allAccess, updateUserAndRole);
Router.delete("/delete/:id", protect, allAccess, deleteUserAndRole);
Router.put("/status/:id", protect, allAccess, toggleUserStatus);
Router.get("/hiring-managers", protect, allAccess, getHiringManagers);

export default Router;
