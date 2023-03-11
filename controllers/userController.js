const path = require('path')
const rootDir = path.dirname(require.main.filename);
const User = require('../models/users')
const bcrypt = require('bcrypt')
const session = require('./sessionController')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'ATIBAPI'
exports.createUser = async (req, res, next) => {
  try {
    const name = req.body.name
    const email = req.body.email
    const phone = req.body.phone
    const password = req.body.password

    const saltrounds = 10
    const hashPassword = await bcrypt.hash(password, saltrounds)
    const result = await User.create({ name: name, email: email, phone: phone, password: hashPassword, isPremiumUser: false,  totalExpense: 0  })
    const token = jwt.sign({ email: result.email, id: result.id }, SECRET_KEY)
    res.status(201).json({ message: 'Successfully Created', token: token, userId: result.id })

  } catch (err) {
    return res.status(400).send();
  }
}
exports.generateAccessToken=(id, name,email, isPremiumUser) => {
  return jwt.sign({ id: id, name: name, email:email, isPremiumUser:isPremiumUser}, SECRET_KEY);
}

exports.displaySignUp = (req, res, next) => {
  res.sendFile(path.join(rootDir, 'public', 'views', 'signup.html'))
}
exports.forgot = (req, res, next) => {
  res.sendFile(path.join(rootDir, 'public','views', 'forgotpassword.html'))
}
exports.loginPage = (req, res, next) => {
  res.sendFile(path.join(rootDir, 'public', 'views', 'login.html'))
}
exports.homePage = (req, res, next) => {
  res.sendFile(path.join(rootDir, 'public', 'views', 'home.html'),{headers: {'Authorization': `123`}})
}

exports.checkUser = async (req, res, next) => {
  try {
    
    const email = req.body.email
    const password = req.body.password
    const user1 = await User.findOne({ where: { email: email } })
    if (!user1) {
      res.status(404).json({ message: 'User Doesnt Exists' })
    }
    const hash = user1.dataValues.password
    await bcrypt.compare(password, hash, function (err, result) {
      if (result == false) {
        return res.status(401).json({ message: 'Wrong Password' })
      }
      const token = jwt.sign({ email: user1.email, id: user1.id }, SECRET_KEY)
      res.status(200).json({ message: 'User Logging successfull', token: exports.generateAccessToken(user1.id,user1.name,user1.email,user1.isPremiumUser), userId:user1.id })
      
    });
  } catch (error) {
    console.log(error);
  }
}


