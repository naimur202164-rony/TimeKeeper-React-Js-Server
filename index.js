const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

// mongo db setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwgkc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function server() {
  try {
    await client.connect();
    const database = client.db("time_zone_db");
    const watchCollection = database.collection("watches");
    const reviewCollection = database.collection("reviews");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");

    // GET WATCHES FROM DB
    app.get("/watches", async (req, res) => {
      const limit = Number(req.query.limit);
      let watches;
      if (limit) {
        watches = await watchCollection.find({}).limit(limit).toArray();
      } else {
        watches = await watchCollection.find({}).toArray();
      }
      res.json(watches);
    });

    //ADD NEW REVIEW TO DB
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // GET ALL REVIEWS FROM DB
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.json(reviews);
    });

    // GET A SPECIFIC WATCH BY ID NAME
    app.get("/watch/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const watch = await watchCollection.findOne(query);

      res.json(watch);
    });

    //GET CURRENT USER'S ORDER
    app.get("/my_order/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: `${email}` };
      const result = await orderCollection.find(query).toArray();
      res.json(result);
    });

    //GET ALL ORDERS
    app.get("/all_orders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.json(result);
    });

    // ADD NEW ORDER TO DB
    app.post("/product/booking", async (req, res) => {
      const product = req.body;
      const result = await orderCollection.insertOne(product);
      res.json(result);
    });

    //ADD NEW WATCH TO DB
    app.post("/watches", async (req, res) => {
      const watch = req.body;
      const result = await watchCollection.insertOne(watch);
      res.json(result);
    });

    // SAVE USER INFO TO DB
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);

      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //CREATE A NEW ADMIN
    app.put("/users/admin", async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // GET A USER WITH ADMIN ROLE
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);

      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //GET ALL ADMINS
    app.get("/admins", async (req, res) => {
      const query = { role: "admin" };
      const admins = await userCollection.find(query).toArray();
      res.send(admins);
    });

    //UPDATE A ORDER STATUS
    app.put("/all_orders/:id", async (req, res) => {
      const id = req.params.id;
      const order = req.body;

      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const update = {
        $set: {
          status: order.status,
        },
      };
      const result = await orderCollection.updateOne(query, update, options);
      res.json(result);
    });

    // DELETE A ORDER
    app.delete("/my_order_list/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);

      res.json(result);
    });

    // DELETE A ORDER
    app.delete("/manage_order/watch/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await watchCollection.deleteOne(query);

      res.json(result);
    });
  } catch {
    // await client.close();
  }
}

server().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from assignment 12");
});

app.listen(port, () => {
  console.log("server running on", port);
});
