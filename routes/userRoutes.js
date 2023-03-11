const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const expenseController = require('../controllers/expenseController')
const auth = require('../middleware/auth')
router.get('/',userController.displaySignUp)
router.use('/login',userController.createUser)
router.get('/loginPage',userController.loginPage)
router.use('/check',userController.checkUser)
router.get('/home',userController.homePage)
router.use('/home/expense',auth.auth,expenseController.createExpense)
router.get('/home/show/:pageNo',auth.auth,expenseController.displayAll)
router.get('/home/delete/:expenseId',auth.auth,expenseController.deleteExpense)
router.post('/home/edit-expense/:expenseId', expenseController.editExpense);
router.get('/password', userController.forgot);
router.get('/download', auth.auth, expenseController.getDownloadExpenses);
router.get('/getAllUrl', auth.auth, expenseController.getDownloadAllUrl);


module.exports=router