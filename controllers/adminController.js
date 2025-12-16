import User from "../models/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()


export async function registerAdmin(req, res) {
    const { Name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create new user
        const newUser = new User({
            Name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Admin registered successfully",
            user: {
                Name: newUser.Name,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering admin",
            error: error.message
        });
    }
}
export async function loginadmin(req,res){
    const email = req.body.email
    const password = req.body.password

    await User.findOne(
        {
            email : email
        }
    ).then(
        (user)=>{
            if(user == null){
                res.status(404).json({
                    message : "user not found"
                })
            }
            else{
                const ispasswordcorrect = bcrypt.compareSync(password,user.password)
                if(ispasswordcorrect){

                    const token = jwt.sign(
                        {
                            email : user.email,
                            Name : user.Name,
                            
                        },
                        process.env.JWT_SECRET,
                    )
                    res.json({
                        token : token,
                        message : "loging successfully"
                    })
                }
                else{
                    res.status(403).json({
                    message : "incorrect password"
                })
                }
            }
        }
    )
}


