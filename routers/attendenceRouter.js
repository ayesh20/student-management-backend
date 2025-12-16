import express from 'express';
import { 
    markAttendance,
    markBulkAttendance,
    getAttendanceByDate,
    getStudentAttendance,
    getAttendanceReport,
    deleteAttendance
} from '../controllers/attendenceController.js';

const attendanceRouter = express.Router();

attendanceRouter.post("/mark", markAttendance);
attendanceRouter.post("/mark-bulk", markBulkAttendance);
attendanceRouter.get("/date/:date", getAttendanceByDate);
attendanceRouter.get("/student/:studentId", getStudentAttendance);
attendanceRouter.get("/report", getAttendanceReport);
attendanceRouter.delete("/delete/:id", deleteAttendance);

export default attendanceRouter;