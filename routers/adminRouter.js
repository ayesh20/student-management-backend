import express from 'express';
import {  loginadmin } from '../controllers/adminController.js';

const adminRouter = express.Router();
adminRouter.post("/login", loginadmin );


export default adminRouter;