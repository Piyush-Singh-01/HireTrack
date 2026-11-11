import express from "express";
import createForm from "./createform.js";  
import updateForm from "./updateform.js";
import deleteForm from "./deleteform.js";
import protect from "../../common/middleware/auth.js";
import { allAccess } from "../../common/middleware/role.js";
import getAllForms from "./getAllForms.js";  

const router = express.Router();

router.post("/",protect, allAccess, createForm);

router.put("/:id",protect, allAccess, updateForm);
router.delete("/:id",protect, allAccess, deleteForm);

router.get("/all", protect, allAccess, getAllForms);  //new route to get all forms 

export default router;

