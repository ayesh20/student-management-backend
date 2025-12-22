import Student from "../models/student.js";

export async function addStudent(req, res) {
    try {
        const { 
            StudentID, 
            StudentName, 
            address, 
            phoneNo, 
            DateOfBirth, 
            gender,
            email
        } = req.body;

       
        if (!StudentID || !StudentName || !address || !phoneNo || !DateOfBirth || !gender) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const existingStudent = await Student.findOne({ StudentID });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "Student with this ID already exists"
            });
        }

        // Create new student
        const newStudent = new Student({
            StudentID,
            StudentName,
            address,
            phoneNo,
            DateOfBirth,
            gender,
            email: email || "",
            attendence: 0, 
            paymentstatus: "pending" 
        });

        await newStudent.save();

        res.status(201).json({
            success: true,
            message: "Student added successfully",
            student: newStudent
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({
            success: false,
            message: "Error adding student",
            error: error.message
        });
    }
}


export async function getAllStudents(req, res) {
    try {
        const students = await Student.find({}).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students: students
        });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching students",
            error: error.message
        });
    }
}


export async function getStudentById(req, res) {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.status(200).json({
            success: true,
            student: student
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching student",
            error: error.message
        });
    }
}


export async function updateStudent(req, res) {
    try {
        const { 
            StudentName, 
            address, 
            phoneNo, 
            DateOfBirth, 
            gender,
            email,
            attendence,
            paymentstatus
        } = req.body;

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        student.StudentName = StudentName || student.StudentName;
        student.address = address || student.address;
        student.phoneNo = phoneNo || student.phoneNo;
        student.DateOfBirth = DateOfBirth || student.DateOfBirth;
        student.gender = gender || student.gender;
        student.email = email !== undefined ? email : student.email;
        student.attendence = attendence !== undefined ? attendence : student.attendence;
        student.paymentstatus = paymentstatus || student.paymentstatus;

        await student.save();

        res.status(200).json({
            success: true,
            message: "Student updated successfully",
            student: student
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating student",
            error: error.message
        });
    }
}

export async function deleteStudent(req, res) {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Student deleted successfully",
            deletedStudent: {
                id: student._id,
                StudentID: student.StudentID,
                StudentName: student.StudentName
            }
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting student",
            error: error.message
        });
    }
}

export async function searchStudents(req, res) {
    try {
        const searchQuery = req.query.query;

        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                message: "Please provide a search query"
            });
        }

        const students = await Student.find({
            $or: [
                { StudentName: { $regex: searchQuery, $options: 'i' } },
                { StudentID: { $regex: searchQuery, $options: 'i' } },
                { phoneNo: { $regex: searchQuery, $options: 'i' } },
                { address: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        res.status(200).json({
            success: true,
            count: students.length,
            students: students
        });
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({
            success: false,
            message: "Error searching students",
            error: error.message
        });
    }
}

export async function updatePaymentStatus(req, res) {
    try {
        const { paymentstatus } = req.body;

        if (!paymentstatus) {
            return res.status(400).json({
                success: false,
                message: "Please provide payment status"
            });
        }

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        student.paymentstatus = paymentstatus;
        await student.save();

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            student: student
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating payment status",
            error: error.message
        });
    }
}


export async function updateAttendance(req, res) {
    try {
        const { attendence } = req.body;

        if (attendence === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide attendance value"
            });
        }

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        student.attendence = attendence;
        await student.save();

        res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            student: student
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating attendance",
            error: error.message
        });
    }
}