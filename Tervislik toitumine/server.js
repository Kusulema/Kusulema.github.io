const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB Connection
const mongoURI = "mongodb+srv://kusulema:timoha123@kusulema.zjonojl.mongodb.net/db?retryWrites=true&w=majority&appName=Kusulema";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// mongoose Schema and Model
const menuSchema = new mongoose.Schema({
    img: String,
    altimg: String,
    title: String,
    descr: String,
    price: Number
});

const MenuItem = mongoose.model('MenuItem', menuSchema, 'menu');

const requestSchema = new mongoose.Schema({
    name: String,
    phone: String
});

const Request = mongoose.model('Request', requestSchema, 'request');

// Function to seed the database
const seedDatabase = async () => {
    try {
        const count = await MenuItem.countDocuments();
        if (count === 0) {
            console.log('No data found in menu collection. Seeding database...');
            const data = fs.readFileSync('db.json', 'utf-8');
            const json = JSON.parse(data);
            await MenuItem.insertMany(json.menu);
            console.log('Database seeded successfully.');
        } else {
            console.log('Menu collection already contains data. Skipping seed.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

// API Routes
app.post('/requests', async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server and seed database
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    seedDatabase();
});