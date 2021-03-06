const express = require('express')

const User = require('../models/user')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const authConfig = require('../config/auth')

const router = express.Router()

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret,{
        expiresIn: 86400,
    })
}

router.post('/register', async(req, res)=>{
    try{

        const{ email } = req.body

        if(await User.findOne({ email }))
            res.status(400).send({ error: 'Usuario já existe' })
        const user = await User.create(req.body)

        user.password = undefined

        return res.send({    
            user,
            token: generateToken({id:user.id}),
        
        })
    }catch(err){
        return res.status(400).send({ error: 'Falha no engano'})
    }
})

router.post('/authenticate',async (req, res)=>{
    const {email, password} = req.body

    const user = await User.findOne({email}).select('+password')

    if(!user)
        res.status(400).send({ error:'usuario nao encontrado'})

    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password'})

    user.password = undefined

    const token = jwt.sign({id: user.id}, authConfig.secret, {
        expiresIn: 86400,
    })

    res.send({
        user,
        token: generateToken({id: user.id})
    })
    
})

module.exports = app => app.use('/auth', router)

