import User from "../models/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()



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


