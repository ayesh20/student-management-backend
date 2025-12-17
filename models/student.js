import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    
    StudentID :{
         type : String,
            required : true,
            unique : true
    },
    StudentName : {
        type : String,
        required : true
    },
    
    address : {
        type : String,
        required : true,
        
    },
    phoneNo : {
        type : String,
        required : true
    },
    DateOfBirth : {
        type : Date,
        required : true
    },
    gender :{
        type : String,
        required : true
    },

    attendence : {
        type : Number,
        required : true
    },
    paymentstatus : {
        type : String,
        required : true,
        default : "pending"
    },
    
})

const Student = mongoose.model("students",studentSchema)

export default Student;


