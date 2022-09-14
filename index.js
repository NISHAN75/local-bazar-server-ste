const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

// middleware
app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsl6uid.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const sellerCollection = client.db("local_bazar").collection("seller");
    const clientCollection = client.db("local_bazar").collection("client");
    const productsCollection = client.db("local_bazar").collection("products");
    const ordersCollection = client.db("local_bazar").collection("orders");
    const paymentCollection = client.db("local_bazar").collection("payment");
    const usersCollection = client.db("local_bazar").collection("users");

    // socal lo

    // get area

    // seller  area

    app.get("/seller", async (req, res) => {
      const location = req.query.roadName;
      const query = { roadName: location };
      const result = await sellerCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { clientEmail: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/pList/:email", async (req, res) => {
      const email = req.params.email;
      const seller = await sellerCollection.findOne({ email: email });
      res.send(seller);
    });
    app.get("/client", async (req, res) => {
      const query = {};
      const cursor = clientCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/allSeller", async (req, res) => {
      const query = {};
      const cursor = sellerCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email: email });
      res.send(result);
    });
  
    app.get("/seller/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await sellerCollection.findOne(query);
      res.send(result);
    });
    app.get("/seller/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await sellerCollection.findOne(query);
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    // all order
    
    app.get("/allOrders", async (req, res) => {
      const query = {};
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.patch('/orders/:id',async(req,res)=>{
      const id = req.params.id;
      const payment=req.body;
      const filter={_id: ObjectId(id)};
      const updateDoc={
        $set:{
          shipment:"delevered",
        }
      }

      const updatedOrders= await ordersCollection.updateOne(filter,updateDoc);
      const result= await paymentCollection.insertOne(payment);
      res.send(updateDoc); 
    });

    // post area
    
    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users)
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });
    // Seller area
    app.post("/seller", async (req, res) => {
      const seller = req.body;
      const result = await sellerCollection.insertOne(seller);
      res.send(result);
    });
    // client area
    app.post("/client", async (req, res) => {
      const client = req.body;
      const result = await clientCollection.insertOne(client);
      res.send(result);
    });
    // products area
    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await productsCollection.insertOne(products);
      res.send(result);
    });
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });

    // delete area
    app.delete('/orders', async(req,res)=>{
      const email = req.query.email;
      const filter= {clientEmail:email};
      const result = await ordersCollection.deleteOne(filter);
      res.send(result)
    });
    app.delete('/allOrders/:id', async(req,res)=>{
      const id = req.params.id;
      const filter={_id: ObjectId(id)};
      const result = await ordersCollection.deleteOne(filter);
      res.send(result)
    });

    



  
  } finally {
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
