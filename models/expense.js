const Sequelize  = require('sequelize');
const sequelize = require('../util/database')

const Expense = sequelize.define('expense', {
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        autoIncrement : true,
        primaryKey : true
    },
    amount : {
        type : Sequelize.STRING,
        allowNull : false
    },
    description : {
        type : Sequelize.STRING,
        allowNull : false,
        unique : false
    },
    category : {
        type : Sequelize.STRING,
        allowNull : false,
        unique : false
    }
}
);

module.exports = Expense;