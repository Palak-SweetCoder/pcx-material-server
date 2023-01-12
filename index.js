const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// -----middleware-----
app.use(cors());
app.use(express.json());

// -------mongodb connection---------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pwfkf3v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// --------------------CRUD FUNCTION START----------------------
async function run() {
    try {
        // console.log('db connected successfully!!!');
        const partsCollection = client.db('pcxMaterial').collection('parts');

        // API TO: Get or Read all data from the database
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        // API TO: Get or Read specific data by id from the database
        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            // No need to declare cursor here. Because we're finding only one item
            const parts = await partsCollection.findOne(query);
            res.send(parts);
        });
    } finally {
        // client.close();
    }
}
run().catch(console.dir);
// --------------------CRUD FUNCTION END----------------------

app.get('/', (req, res) => {
    res.send('Hello From PCX Server!');
});

app.listen(port, () => {
    console.log(`PCX app listening on port ${port}`);
});
