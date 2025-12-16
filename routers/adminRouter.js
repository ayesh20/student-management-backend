import express from 'express';
import {  registerAdmin, loginadmin } from '../controllers/adminController.js';

const adminRouter = express.Router();
adminRouter.post("/login", loginadmin );
adminRouter.post("/register", registerAdmin);


export default adminRouter;