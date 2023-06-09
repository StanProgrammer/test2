const express = require('express');
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/users')
const Expense = require('./models/expense')
const Order = require('./models/order');
const Forgotpassword = require('./models/forgotpassword');
const DownloadUrl = require('./models/downloadUrl');

const userRoutes = require('./routes/userRoutes')
const purchaseRoutes = require('./routes/purchaseRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const forgotpasswordRoutes = require('./routes/forgotRoutes');


const sequelize = require('./util/database');
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

const app = express();
// app.use(helmet())
app.use(
  helmet({
    contentSecurityPolicy: false,
    
  })
)
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));
// app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use(userRoutes)
app.use('/user', userRoutes);
app.use('/purchase',purchaseRoutes)
app.use('/premium', premiumRoutes);
app.use('/password', forgotpasswordRoutes);


User.hasMany(Expense)
Expense.belongsTo(User)

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(DownloadUrl);
DownloadUrl.belongsTo(User);

sequelize.sync()
.then(
app.listen(process.env.PORT,()=>{
  console.log('no error');
}))
.catch(err=>{console.log(err);})
