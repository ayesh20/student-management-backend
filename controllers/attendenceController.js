import Attendance from "../models/attendence.js";
import Student from "../models/student.js";

export async function markAttendance(req, res) {
    try {
        const { studentId, date, status, remarks } = req.body;
        const markedBy = req.user.email; // From JWT token

        // Validation
        if (!studentId || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "Please provide studentId, date, and status"
            });
        }

        // Get student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Check if attendance already exists for this date
        const existingAttendance = await Attendance.findOne({
            studentId: studentId,
            date: new Date(date)
        });

        if (existingAttendance) {
            // Update existing attendance
            existingAttendance.status = status;
            existingAttendance.remarks = remarks || '';
            existingAttendance.markedBy = markedBy;
            await existingAttendance.save();

            return res.status(200).json({
                success: true,
                message: "Attendance updated successfully",
                attendance: existingAttendance
            });
        }

        // Create new attendance record
        const newAttendance = new Attendance({
            studentId: student._id,
            StudentID: student.StudentID,
            StudentName: student.StudentName,
            date: new Date(date),
            status: status,
            remarks: remarks || '',
            markedBy: markedBy
        });

        await newAttendance.save();

        // Update student's total attendance count if present
        if (status === 'present') {
            student.attendence = (student.attendence || 0) + 1;
            await student.save();
        }

        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance: newAttendance
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: "Error marking attendance",
            error: error.message
        });
    }
}


export async function markBulkAttendance(req, res) {
    try {
        const { attendanceRecords, date } = req.body;
        const markedBy = req.user.email;

        if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide attendance records array"
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const record of attendanceRecords) {
            try {
                const student = await Student.findById(record.studentId);
                
                if (!student) {
                    results.failed.push({
                        studentId: record.studentId,
                        reason: "Student not found"
                    });
                    continue;
                }

                // Check if attendance already exists
                const existingAttendance = await Attendance.findOne({
                    studentId: record.studentId,
                    date: new Date(date)
                });

                if (existingAttendance) {
                    // Update existing
                    existingAttendance.status = record.status;
                    existingAttendance.remarks = record.remarks || '';
                    existingAttendance.markedBy = markedBy;
                    await existingAttendance.save();
                    
                    results.success.push(existingAttendance);
                } else {
                    // Create new
                    const newAttendance = new Attendance({
                        studentId: student._id,
                        StudentID: student.StudentID,
                        StudentName: student.StudentName,
                        date: new Date(date),
                        status: record.status,
                        remarks: record.remarks || '',
                        markedBy: markedBy
                    });

                    await newAttendance.save();

                    // Update student's total attendance count
                    if (record.status === 'present') {
                        student.attendence = (student.attendence || 0) + 1;
                        await student.save();
                    }

                    results.success.push(newAttendance);
                }
            } catch (err) {
                results.failed.push({
                    studentId: record.studentId,
                    reason: err.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Attendance marked for ${results.success.length} students`,
            results: results
        });
    } catch (error) {
        console.error('Bulk mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: "Error marking bulk attendance",
            error: error.message
        });
    }
}


export async function getAttendanceByDate(req, res) {
    try {
        const { date } = req.params;

        const attendanceRecords = await Attendance.find({
            date: new Date(date)
        }).sort({ StudentName: 1 });

        res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            date: date,
            attendance: attendanceRecords
        });
    } catch (error) {
        console.error('Get attendance by date error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching attendance",
            error: error.message
        });
    }
}

export async function getStudentAttendance(req, res) {
    try {
        const { studentId } = req.params;

        const attendanceRecords = await Attendance.find({
            studentId: studentId
        }).sort({ date: -1 });

        // Calculate statistics
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
        const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;
        const lateDays = attendanceRecords.filter(a => a.status === 'late').length;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            statistics: {
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                attendancePercentage
            },
            attendance: attendanceRecords
        });
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching student attendance",
            error: error.message
        });
    }
}


export async function getAttendanceReport(req, res) {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide startDate and endDate"
            });
        }

        const attendanceRecords = await Attendance.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ date: -1, StudentName: 1 });

        // Group by student
        const studentStats = {};
        
        attendanceRecords.forEach(record => {
            if (!studentStats[record.studentId]) {
                studentStats[record.studentId] = {
                    StudentID: record.StudentID,
                    StudentName: record.StudentName,
                    present: 0,
                    absent: 0,
                    late: 0,
                    total: 0
                };
            }
            
            studentStats[record.studentId].total++;
            if (record.status === 'present') studentStats[record.studentId].present++;
            if (record.status === 'absent') studentStats[record.studentId].absent++;
            if (record.status === 'late') studentStats[record.studentId].late++;
        });

        // Calculate percentages
        Object.keys(studentStats).forEach(key => {
            const stats = studentStats[key];
            stats.attendancePercentage = ((stats.present / stats.total) * 100).toFixed(2);
        });

        res.status(200).json({
            success: true,
            startDate,
            endDate,
            totalRecords: attendanceRecords.length,
            studentStats: Object.values(studentStats),
            records: attendanceRecords
        });
    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({
            success: false,
            message: "Error generating attendance report",
            error: error.message
        });
    }
}

export async function deleteAttendance(req, res) {
    try {
        const { id } = req.params;

        const attendance = await Attendance.findById(id);
        
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        // If it was marked as present, decrease student's attendance count
        if (attendance.status === 'present') {
            const student = await Student.findById(attendance.studentId);
            if (student && student.attendence > 0) {
                student.attendence = student.attendence - 1;
                await student.save();
            }
        }

        await Attendance.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Attendance record deleted successfully"
        });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting attendance record",
            error: error.message
        });
    }
}