require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('../routrer/index')

const app = express()
const port = process.env.PORT || 5000;

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: err.message });
});

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/api', router)

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error(error);
    }
};

start();
