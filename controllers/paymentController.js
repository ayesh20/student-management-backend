import Payment from "../models/payment.js";
import Student from "../models/student.js";


export async function addPayment(req, res) {
    try {
        const { 
            studentId, 
            amount, 
            paymentMethod, 
            paymentType,
            month,
            remarks 
        } = req.body;
        
        const collectedBy = req.user.email; 

        if (!studentId || !amount || !paymentMethod || !paymentType) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        if (paymentType === 'monthly_fee' && month) {
            const existingPayment = await Payment.findOne({
                studentId: studentId,
                month: month,
                paymentType: 'monthly_fee'
            });

            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message: `Payment for ${month} already exists`
                });
            }
        }

        const count = await Payment.countDocuments();
        const receiptNumber = `REC${Date.now()}-${count + 1}`;

        const newPayment = new Payment({
            studentId: student._id,
            StudentID: student.StudentID,
            StudentName: student.StudentName,
            amount: amount,
            paymentMethod: paymentMethod,
            paymentType: paymentType,
            month: month || null,
            receiptNumber: receiptNumber,
            remarks: remarks || '',
            collectedBy: collectedBy,
            status: 'completed'
        });

        await newPayment.save();

        
        student.paymentstatus = 'completed';
        await student.save();

        res.status(201).json({
            success: true,
            message: "Payment added successfully",
            payment: newPayment
        });
    } catch (error) {
        console.error('Add payment error:', error);
        res.status(500).json({
            success: false,
            message: "Error adding payment",
            error: error.message
        });
    }
}

export async function getAllPayments(req, res) {
    try {
        const payments = await Payment.find({})
            .sort({ paymentDate: -1 })
            .populate('studentId', 'StudentID StudentName email phoneNo');

        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

        res.status(200).json({
            success: true,
            count: payments.length,
            totalAmount: totalAmount,
            payments: payments
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching payments",
            error: error.message
        });
    }
}

export async function getStudentPayments(req, res) {
    try {
        const { studentId } = req.params;

        const payments = await Payment.find({ studentId: studentId })
            .sort({ paymentDate: -1 });

        const totalPaid = payments.reduce((sum, payment) => 
            payment.status === 'completed' ? sum + payment.amount : sum, 0
        );

        res.status(200).json({
            success: true,
            count: payments.length,
            totalPaid: totalPaid,
            payments: payments
        });
    } catch (error) {
        console.error('Get student payments error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching student payments",
            error: error.message
        });
    }
}

export async function getPaymentByReceipt(req, res) {
    try {
        const { receiptNumber } = req.params;

        const payment = await Payment.findOne({ receiptNumber: receiptNumber })
            .populate('studentId');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.status(200).json({
            success: true,
            payment: payment
        });
    } catch (error) {
        console.error('Get payment by receipt error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching payment",
            error: error.message
        });
    }
}

export async function getPaymentsByMonth(req, res) {
    try {
        const { month } = req.params; 

        const payments = await Payment.find({ 
            month: month,
            paymentType: 'monthly_fee'
        }).sort({ StudentName: 1 });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

        res.status(200).json({
            success: true,
            month: month,
            count: payments.length,
            totalAmount: totalAmount,
            payments: payments
        });
    } catch (error) {
        console.error('Get payments by month error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching monthly payments",
            error: error.message
        });
    }
}

export async function getPaymentStats(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let query = { status: 'completed' };
        
        if (startDate && endDate) {
            query.paymentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const payments = await Payment.find(query);

        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalPayments = payments.length;

        const byMethod = payments.reduce((acc, p) => {
            acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
            return acc;
        }, {});

        const byType = payments.reduce((acc, p) => {
            acc[p.paymentType] = (acc[p.paymentType] || 0) + p.amount;
            return acc;
        }, {});

        const uniqueStudents = [...new Set(payments.map(p => p.studentId.toString()))];

        res.status(200).json({
            success: true,
            statistics: {
                totalAmount: totalAmount,
                totalPayments: totalPayments,
                uniqueStudents: uniqueStudents.length,
                byMethod: byMethod,
                byType: byType,
                averagePayment: totalPayments > 0 ? (totalAmount / totalPayments).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Get payment stats error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching payment statistics",
            error: error.message
        });
    }
}

export async function updatePayment(req, res) {
    try {
        const { id } = req.params;
        const { amount, paymentMethod, paymentType, remarks, status } = req.body;

        const payment = await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        if (amount) payment.amount = amount;
        if (paymentMethod) payment.paymentMethod = paymentMethod;
        if (paymentType) payment.paymentType = paymentType;
        if (remarks !== undefined) payment.remarks = remarks;
        if (status) payment.status = status;

        await payment.save();

        res.status(200).json({
            success: true,
            message: "Payment updated successfully",
            payment: payment
        });
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating payment",
            error: error.message
        });
    }
}

export async function deletePayment(req, res) {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        await Payment.findByIdAndDelete(id);

  
        const remainingPayments = await Payment.find({
            studentId: payment.studentId,
            status: 'completed'
        });

       
        if (remainingPayments.length === 0) {
            const student = await Student.findById(payment.studentId);
            if (student) {
                student.paymentstatus = 'pending';
                await student.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Payment deleted successfully"
        });
    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting payment",
            error: error.message
        });
    }
}

export async function getPendingPayments(req, res) {
    try {
       
        const pendingStudents = await Student.find({ 
            paymentstatus: 'pending' 
        }).select('StudentID StudentName email phoneNo paymentstatus');

        res.status(200).json({
            success: true,
            count: pendingStudents.length,
            students: pendingStudents
        });
    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching pending payments",
            error: error.message
        });
    }
}