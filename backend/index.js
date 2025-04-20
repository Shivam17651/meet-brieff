require('dotenv').config();

const express = require('express');
const userRouter = require ('./routers/userRouter');
const cors = require('cors');

const app = express();

const port =process.env.PORT ||5000;

app.use(cors({
    origin: '*'

}))
app.use (express.json());
app.use('/users',userRouter);

app.get ('/' , (req,res) => {
    res.send('response from express')
})

app.get('/add' , (req,res) => {
    res.send('response from add')
});

app.listen (port , () => {
    console.log('server started');
    
})