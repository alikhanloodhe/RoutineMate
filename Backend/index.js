const express = require('express'); //requiring / importing from module express it will return a function
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const addTaskRoutes = require('./routes/addTaskRoutes');

const app = express(); // The function when called return an object that has various methods and properties

app.use(cors()); 
app.use(express.json()); // parse incoming JSON

app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/Tasks',addTaskRoutes);

const PORT = process.env.PORT || 5000;
// console.dir(app);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // app.listen turns the server into the listening mode means it will wait for the client request and then respond
