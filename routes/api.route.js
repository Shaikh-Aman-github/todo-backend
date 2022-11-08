const router = require("express").Router();
const {body, validationResult} = require("express-validator")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const itemValidationRules = [
    body('item', 'Enter Your task').isLength({ min : 1})
]

router.get('/items', async (req, res, next) =>{
    try {
        const items = await prisma.items.findMany({
            orderBy: [{id: 'asc'}],
            include: {users: true},
        })
        res.json(items) 
    } catch (error) {
        next(error)
    }
});

router.get('/items/:id', async (req, res, next) =>{
    try {
        const {id} =req.params
        const item = await prisma.items.findUnique({    
            orderBy: [{id: 'asc'}],
            where:{
                id: (id)
            }
        })
        res.json(item)
    } catch (error) {
        next(error)
    }
});

//const simpleValidationResult = validationResult.withDefaults({
   // formatter: err => err.msg,
//})

const checkForErrors = (req, res, next) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        //return res.status(422).json(errors.mapped())
        const alert  = errors.array()
        res.render('items', {
            alert
        })
    }
    next()
}

router.post('/items', itemValidationRules, checkForErrors, async (req, res) =>{
    const {item, status, id, userId} = req.body
        try {
            const postData = await prisma.items.create({
                //where:{userId: id},
                data:{
                    item, 
                    status,
                    id:userId,
                    users: { connect: {id}}
                }
            })
            return res.json(postData)
        } catch (error) {   
            return console.log(error);
        }

});


router.delete('/items/:id', async (req, res, next) =>{
    try {
        const {id} = req.params
        const deletedItems = await prisma.items.delete({
            where:{
                id: Number(id),
            }
        })
        res.json(deletedItems)
    } catch (error) {
        next(error)
    }
});

router.put('/items/:id', async (req, res, next) =>{
    try {
        const id = req.params.id
        const updatedItems = await prisma.items.update({
            where:{
                id: Number(id)
            },
            data: {
                item: req.body.item,
                status: req.body.status
            }
        })
        res.json(updatedItems)		
    } catch (error) {
        next(error)
    }
});
//-------------------------------------------------User ACCOUNT api------------------------------------------------------//
const UserValidationRules = [
    body('name', 'Enter valid name')
        .isLength({ min : 1}),
    body('email')
        .isLength({ min : 1})
        .withMessage('Email must not be empty')
        .isEmail()
        .withMessage('Must be a valid emaail address'),
    body('password')
        .isLength({ min : 1})
        .withMessage('password must not be empty')
]
const uersSimpleValidationResult = validationResult.withDefaults({
    formatter: err => err.msg,
})

const UserCheckForErrors = (req, res, next) =>{
    const errors = uersSimpleValidationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(errors.mapped())
    }
    next()
}

//create/register user
router.post('/users', UserValidationRules,  UserCheckForErrors, async (req, res) =>{
    const { name, email, password } = req.body
    try {
        const existingUser = await prisma.user.findUnique({
            where:{email}
        })
        if(existingUser) throw {email: "Email already exists"}
        const user = await prisma.user.create({
            data: {name, email, password},
        })
        return res.json(user)
    } catch (err) {
        console.log(err);
        return res.status(400).json(err)
    }
});

//login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try { 
    const userlogin = await prisma.user.findUnique({
        where:{email: email},
    })
    if(!userlogin) res.json({err: "User Doesn't Exist"});
    res.json(userlogin);
    }catch (err) {
        console.log(err);
        return res.status(400).json(err)
    }
})

//Read user
router.get('/users', async (req, res) =>{
    try {
       const users = await prisma.user.findMany({
        orderBy: [{id: 'asc'}],
         select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            password: true,
            items: {
                select: {
                    id: true,
                    userId: true,
                    item: true,
                    status: true,
                    uuid: true, 
                },    
           },
        },
        //include: {items: true},
       })
        return res.json(users)
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: 'Somthing went wrong'})
    }
});

//Update user
router.put('/users', itemValidationRules,  checkForErrors, async (req, res) =>{
    const { name, email, password } = req.body
    const uuid = req.params.uuid
    try {
        let user = await prisma.user.findUnique({where:{uuid}})
        console.log(user);
        if(!user) throw {user: "User not found"}

        user = await prisma.user.update({
            where: {uuid},
            data: {name, email, password},
        })
        return res.json(user)
    } catch (err) {
        console.log(err);
        return res.status(404).json(err)
    }
});

//Delete user
router.delete('/users/:uuid', async (req, res) =>{
    try {
       await prisma.user.delete({ 
        where: {
            uuid: req.params.uuid
        }
       })
        return res.json({message: 'User deleted'})
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: 'Somthing went wrong'})
    }
});

//find by id user
router.get('/users/:email', async (req, res) =>{
    try {
    const user = await prisma.user.findUnique(
        {
            where:{email: req.params.email},
            select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
                password: true,
                items: {
                orderBy: [{id: 'asc'}],
                    select: {
                        id: true,
                        userId: true,
                        item: true,
                        status: true,
                        uuid: true, 
                    },    
               },
            },
        })
        return res.json(user)
    } catch (err) {
        console.log(err);
        return res.status(404).json({user: 'user not found'})
    }
});
module.exports = router;
