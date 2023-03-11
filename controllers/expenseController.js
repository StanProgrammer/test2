const path = require('path')
const rootDir = path.dirname(require.main.filename);
const User = require('../models/users')
const bcrypt = require('bcrypt')
const Expense = require('../models/expense')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'ATIBAPI'
const sequelize = require('../util/database');
const DownloadUrl = require('../models/downloadUrl');
const UserServices = require('../services/UserService');
const S3services = require('../services/S3services');

exports.getDownloadExpenses = async (req, res, next) => {
    try {
        const expenses = await UserServices.getExpenses(req);
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId = req.user.id;
        const filename = `${userId}Expense${new Date()}.txt`;
        const fileURL = await S3services.uploadToS3(stringifiedExpenses,filename);

        const downloadUrlData = await req.user.createDownloadUrl({
            fileURL: fileURL,
            filename
        });

        res.status(200).json({fileURL, downloadUrlData, success:true});
    } catch(err) {
        console.log(err);
        res.status(500).json({err,success:false,fileURL:''})
    }
}


exports.getDownloadAllUrl = async(req,res,next) => {
    try {
        let urls = await req.user.getDownloadUrls();
        if(!urls){
            res.sttus(404).json({ message: 'no urls found'})
        }
        res.status(200).json({ urls, success: true})
    } catch (error) {
        res.status(500).json({error})
    }
}

exports.createExpense = async(req, res, next) => {
    
    try{
    const sequelizeTransaction = await sequelize.transaction(); 
    const token = req.header('Authorization');
    const user = jwt.verify(token, SECRET_KEY);
    const id=user.id
    const amount = req.body.amount
    const description = req.body.description
    const category = req.body.category
    const data=await Expense.create({
        amount: amount,
        description: description,
        category: category,
        userId: id
    },
    {transaction: sequelizeTransaction})
    const tExpense = +req.user.totalExpense + +amount;
    User.update(
        { totalExpense: tExpense},
        {where: {id:req.user.id}}
        )
    await sequelizeTransaction.commit();
    res.status(201).json( data);
    } catch (error) {
        await sequelizeTransaction.rollback();
        res.status(500).json({error:error})
    } 
}


exports.displayAll = async (req, res, next) => {
    try{
    const token = req.header('Authorization');
    const user = jwt.verify(token, SECRET_KEY);
    const id=user.id
    // const result = await Expense.findAll({where:{userId: id}})
    // res.json(result)
    let page = req.params.pageNo || 1;
        // let Items_Per_Page = 10;
        let Items_Per_Page = +req.query.perpage;
        const totalItems = await Expense.count({where: {userId: id}});
        const data = await req.user.getExpenses({offset: (page-1)*Items_Per_Page,limit: Items_Per_Page})

        res.status(200).json({
            data,
            info: {
                currentPage: page,
                hasNextPage: totalItems > page * Items_Per_Page,
                hasPreviousPage: page > 1,
                nextPage: +page + 1,
                previousPage: +page - 1,
                lastPage: Math.ceil(totalItems / Items_Per_Page) 
            }
        });
    }catch(error){
        console.log(error);
    }
}

exports.deleteExpense = async (req, res, next) => {
    try{
        const sequelizeTransaction = await sequelize.transaction();
        const expenseId = req.params.expenseId;
    const token = req.header('Authorization');
    const user = jwt.verify(token, SECRET_KEY);
    const id=user.id
    const expenseField = await Expense.findByPk(expenseId, {where: { userId: id},transaction: sequelizeTransaction})
        await expenseField.destroy({transaction: sequelizeTransaction});
        const userTExpense = await User.findByPk(id,{
            attributes: ['totalExpense'],
            raw: true,
            transaction: sequelizeTransaction
        });
        const editedTotal = userTExpense.totalExpense - expenseField.dataValues.amount;
        await User.update({totalExpense: editedTotal},{where: {id:id}, transaction:sequelizeTransaction})
        await sequelizeTransaction.commit();
        
        res.status(201).json({delete: expenseField});
}catch(error){
    console.log(error);
}
}

exports.editExpense = async (req,res,next)=>{
    const sequelizeTransaction = await sequelize.transaction();
    try{
    const token = req.header('Authorization');
    const user = jwt.verify(token, SECRET_KEY);
    const id=user.id
    const expenseId = req.params.expenseId;
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const befExpense = await Expense.findByPk(expenseId,{
        attributes: ['amount'],
        raw: true,
        transaction: sequelizeTransaction
    });
    const chUser = await User.findByPk(id,{
        attributes: ['totalExpense'],
        raw: true,
        transaction: sequelizeTransaction
    });

    const updatedExpense = +chUser.totalExpense - +befExpense.amount + +amount;
    const updatedUser = await User.update({
        totalExpense: updatedExpense
    },{where: {id:id},transaction: sequelizeTransaction})

    const data = await Expense.update({
        amount: amount,
        description:description,
        category:category
    },{where: {id:expenseId}, transaction: sequelizeTransaction});
    sequelizeTransaction.commit();
    res.status(201).json( data);
    } catch (err) {
        console.log(err);
        res.status(500).json({error:err})
    } 
}