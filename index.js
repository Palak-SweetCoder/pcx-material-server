const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// ----->middleware<-----
app.use(cors());
app.use(express.json());

// ------->mongodb connection<---------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pwfkf3v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// -------------------->CRUD FUNCTION START<----------------------
async function run() {
    try {
        console.log('DB connected successfully!!!');
        const partsCollection = client.db('pcxMaterial').collection('parts');
        const ordersCollection = client.db('pcxMaterial').collection('orders');
        const reviewsCollection = client
            .db('pcxMaterial')
            .collection('reviews');

        // ------->API TO: Get or Read all parts data from the database<-------
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        // ------->API TO: Get or Read specific parts data by id from the database<-------
        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            // No need to declare cursor here. Because we're finding only one item
            const parts = await partsCollection.findOne(query);
            res.send(parts);
        });

        // ------->API TO: Get or Read all orders data from the database<-------
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.send(result);
        });

        // ------->API TO: Get or Read specific orders data by id from the database<-------
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // ------->API TO: Get or Read specific orders data by id from the database<-------
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const payableOrder = await ordersCollection.findOne(query);
            res.send(payableOrder);
        });

        // ------->API TO: Get or DELETE specific orders data by id from the database<-------
        app.delete('/orders', async (req, res) => {
            const query = { _id: ObjectId(req.query.id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        });

        // ------->API TO: Get or UPDATE specific orders data by id from the database<-------
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId,
                },
            };
            const updatedOrder = await ordersCollection.updateOne(
                filter,
                updatedDoc
            );
            res.send(updatedDoc);
        });

        // -------------->STRIPE API<-------------
        app.post('/create-payment-intent', async (req, res) => {
            const parts = req.body;
            const price = parts.price;
            const amount = price * 1000;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card'],
            });
            res.send({ clientSecret: paymentIntent.client_secret });
        });

        // ------->API TO: Get all reviews data from the database<-------
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // ------->API TO: Post a review data into the database<-------
        app.post('/reviews', async (req, res) => {
            const clientReview = req.body;
            const reviews = await reviewsCollection.insertOne(clientReview);
            res.send(reviews);
        });
    } finally {
        // client.close();
    }
}
run().catch(console.dir);
// -------------------->CRUD FUNCTION END<----------------------

app.get('/', (req, res) => {
    res.send('Hello From PCX Server!');
});

app.listen(port, () => {
    console.log(`PCX app listening on port ${port}`);
});
