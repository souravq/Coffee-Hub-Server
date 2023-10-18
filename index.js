const express = require("express");
const { MongoClient, ServerApiVersion , ObjectId} = require('mongodb');

const cors = require("cors");

const app = express();


app.use(cors());

require('dotenv').config()

const PORT = process.env.APP_PORT || 5000;
const uri = `mongodb+srv://${process.env.APP_USERNAME}:${process.env.APP_PASS}@cluster1.h1mhvli.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);


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


// Fetch All Coffee Data
app.get('/coffee', async (req, res) => {
  try {
    const result = await req.db.find().toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetch Single Coffee Data
app.get('/coffee/:id', async (req, res) => {
    let id = req.params.id;
    console.log("Enter");
    //console.log(id);
    try {
      const result = await req.db.findOne({_id:new ObjectId(id)});
      console.log(result);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

// ADD COFFEE POST API

app.post('/coffee', async (req, res) => {
    const data = req.body;
    console.log(data);
  try {
    const result = await req.db.insertOne(data);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// UPDATE COFFEE PUT API

app.put("/coffee", async(req,res)=>{
    const data = req.body;
    console.log(data);
    try{
        const filter = {_id:new ObjectId(data.coffeeId)};
        const options = {upsert:true};
        const updateDoc ={
            $set:{
                coffeeName:data.coffeeName,
                coffeeChef:data.coffeeChef,
                coffeeSupplier:data.coffeeSupplier,
                coffeeTaste:data.coffeeTaste,
                coffeeCategory: data.coffeeCategory,
                coffeePrice:data.coffeePrice,
                coffeePhotoUrl:data.coffeePhotoUrl
            }
        }
        const result = await req.db.updateOne(filter,updateDoc,options);
        res.send(result);

    }catch(error){
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

// Delete Coffee Api

app.delete("/coffee/:id",async(req,res)=>{
    const id = req.params.id;
    try{
        const result = await req.db.deleteOne({_id: new ObjectId(id)});
        console.log(result);
        res.send(result);

    }catch(error){
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

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
   // console.log(process.env);
  console.log(`App is listening on PORT ${PORT}`);
});
