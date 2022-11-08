const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));

//app.use(require('./routes/auth'));
app.use('/api', require('./routes/api.route'));


app.use((req, res, next)=>{
    next(createError.NotFound());
});

app.use((req, res, next)=>{
    res.status(err.status || 500);
    res.send({
        status: err.status || 500,
        message: err.message,
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=> console.log(`http://localhost:${PORT}`));