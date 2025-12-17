import express from 'express';
import { addPayment,getAllPayments,getStudentPayments,getPaymentByReceipt,getPaymentsByMonth,getPaymentStats,updatePayment,deletePayment,getPendingPayments } from '../controllers/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.post("/add", addPayment);
paymentRouter.get("/all", getAllPayments);
paymentRouter.get("/pending", getPendingPayments);
paymentRouter.get("/stats", getPaymentStats);
paymentRouter.get("/student/:studentId", getStudentPayments);
paymentRouter.get("/receipt/:receiptNumber", getPaymentByReceipt);
paymentRouter.get("/month/:month", getPaymentsByMonth);
paymentRouter.put("/update/:id", updatePayment);
paymentRouter.delete("/delete/:id", deletePayment);

export default paymentRouter;