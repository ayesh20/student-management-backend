import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'online'],
        required: true
    },
    paymentType: {
        type: String,
        enum: ['monthly_fee', 'registration', 'exam_fee', 'other'],
        required: true,
        default: 'monthly_fee'
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    month: {
        type: String, // e.g., "2024-12" for December 2024
        required: function() {
            return this.paymentType === 'monthly_fee';
        }
    },
    receiptNumber: {
        type: String,
        unique: true,
        required: true
    },
    remarks: {
        type: String,
        default: ''
    },
    collectedBy: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'refunded'],
        default: 'completed'
    }
}, {
    timestamps: true
});


paymentSchema.index({ studentId: 1, paymentDate: -1 });
paymentSchema.index({ StudentID: 1 });
paymentSchema.index({ receiptNumber: 1 });
paymentSchema.index({ month: 1 });


paymentSchema.pre('save', async function(next) {
    if (!this.receiptNumber) {
        const count = await mongoose.model('payments').countDocuments();
        this.receiptNumber = `REC${Date.now()}-${count + 1}`;
    }
    next();
});

const Payment = mongoose.model("payments", paymentSchema);

export default Payment;