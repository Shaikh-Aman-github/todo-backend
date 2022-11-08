const router = require("express").Router();
const {body, validationResult} = require("express-validator")

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

app.post('/login', (req, res) => {
    const { email, password } = req.body
    User.findOne({email: email}, (err, user) => {
        if(user){
            if( password === user.password ){
                res.send({message: "Login Successfully", user: user})
            }else{
                res.send({message: "Password didn't match"})
            }
        }else{
            res.send({message: "User not Registered"}) 
        }
    })
})

app.post('/register', (req, res) => {
    const { name, email, password } = req.body
    User.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User Already Registered!!!"})
        }else{
            const user = new User({
                name,
                email,
                password
            })
            user.save(err => {
                if(err){
                    res.send(err)
                }else{
                    res.send({message: "Successfully Registered, please login Now"})
                }
            })
        }
    })
                   
})

module.exports = router; 