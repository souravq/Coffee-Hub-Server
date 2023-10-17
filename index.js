const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');

const cors = require("cors");

const app = express();

app.use(cors());

const PORT = 5000;
const uri = "mongodb+srv://souravbera515:mJZyARsep2pPLuYY@cluster1.h1mhvli.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware to parse JSON data
app.use(express.json());

// Connect to MongoDB when the application starts
client.connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the application if there's an error connecting to MongoDB
  });

// Middleware to ensure the MongoDB client is available to route handlers
app.use((req, res, next) => {
  req.db = client.db("CoffeeHub").collection("Coffee");
  next();
});

app.get('/', (req, res) => {
  res.send("Hello World");
});

app.get('/coffee', async (req, res) => {
  try {
    const result = await req.db.find().toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/coffee', async (req, res) => {
    const data = req.body;
    console.log(data);
  try {
    const myDoc = { coffeeName: "Americano Coffee", chef: "Mr. Matin Paul", price: "890" };
    const result = await req.db.insertOne(data);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Close the MongoDB connection when the application is terminated
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`App is listening on PORT ${PORT}`);
});
