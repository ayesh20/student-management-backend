import express from 'express';
import {  getAllStudents,
  getStudentById,
  addStudent, deleteStudent, updateStudent,
  searchStudents } from '../controllers/studentController.js';

  const studentRouter = express.Router();
studentRouter.get("/", getAllStudents );
studentRouter.get("/search", searchStudents );
studentRouter.get("/:id", getStudentById );
studentRouter.post("/add", addStudent );
studentRouter.put("/update/:id", updateStudent );
studentRouter.delete("/delete/:id", deleteStudent );

export default studentRouter;