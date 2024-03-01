require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors')

// Initialize Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //to read the json data
app.use(cors());

const port = process.env.PORT || 3000; //initialised the port

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Check MongoDB connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



const dummy = require('./models/dummy');
const User = require('./models/users');
const loggedUsers = require('./models/loggedinUsers');
const loggedinUsers = require('./models/loggedinUsers');
// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

// Route to send OTP
app.post('/sendOTP', async (req, res) => {
  const { email } = req.body;
  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save user email and OTP to the database
    await User.findOneAndUpdate({ email }, { otp:otp, createdAt: Date.now() }, { upsert: true });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);

    res.status(200).send({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send({ message: 'Error sending OTP' });
  }
});

app.post('/verify',async(req,res)=>{
  const {email,otp} = req.body;
  const currentTime = Date.now();
  const expiryTime = currentTime - (1*60*1000);
  console.log(expiryTime);
  console.log(currentTime);

  try{
    const existingUser = await User.findOne({email});

    if(!existingUser){
      res.status(400).send({"message":"User Not Found"});
      return;
    }

    const user = await User.findOne({email,otp, createdAt : {$gt : expiryTime}});
    console.log(user);

    if(!user){
      res.status(400).send({'message' : 'Invalid or expired OTP'});
      return;
    }
    await loggedUsers.findOneAndUpdate({email},{email}, {upsert:true});
    const payload={
      email:email
    }

    const token=jwt.sign(payload,"jwt_secret");
    res.send({'message':'logged in succefully', 'jwt_token' : token}).send(200);
  }
  catch(err){
    console.log(err);
    res.send({'message':'Error Verifying OTP'}).status(500);
  }
});

app.get('/', async (req,res) => {
  const data = await loggedinUsers.find();
  res.send(data).status(200);
})

async function insert(){
  await dummy.create({
    name:"haridummy",
    email:"hari@gmail.com"
  },{
    email:"namitha",
    name:"namitha@gmail.com"
  })
}
insert();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
