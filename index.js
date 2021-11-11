const express = require("express");
const app = (express());
const port = 5000
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

// MiddleWare
app.use(cors());
app.use(express.json());

// pass:zGEDFRox4FsPWacL
const uri = "mongodb+srv://timekeeper:zGEDFRox4FsPWacL@cluster0.tlrw7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Server

app.get('/', (req, res) => {
    res.send('Hello World!')
})


// Routeinjg
async function run() {
    try {
        await client.connect();
        const database = client.db("TimeKeeper-shop");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        //////////
        // Get the Prodcut from Mongodb
        app.get('/products', async (req, res) => {
            const result = await productCollection.find({}).toArray();
            res.send(result)
        })
        // Post the Products

        app.post('/order', async (req, res) => {
            const result = await orderCollection.insertOne(req.body);
            res.send(result);
            console.log(result)
        })
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderCollection.find(query);
            const productOrderd = await cursor.toArray();
            res.send(productOrderd)
        })
        // Delet items

        app.delete("/deleteProduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const result = await orderCollection.deleteOne(query);
            res.send(result)
            console.log(result);

        });






    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})