import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    StudentID: {
        type: String,
        required: true
    },
    StudentName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        required: true
    },
    remarks: {
        type: String,
        default: ''
    },
    markedBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create compound index to prevent duplicate attendance for same student on same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

attendanceSchema.index({ date: -1 });
attendanceSchema.index({ StudentID: 1 });

const Attendance = mongoose.model("attendances", attendanceSchema);

export default Attendance;