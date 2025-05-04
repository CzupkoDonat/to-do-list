const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const client = new MongoClient(process.env.URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

const dbName = 'list_db';

async function run() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('lists');
        const listData = [
            { task: "", status: "", date: new Date()}
        ];
        await collection.insertMany(listData);
        console.log("Dokumentumok beszúrása sikeres a list kollekcióba");
    } catch (err) {
        console.log("Hiba történt" + err);
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir)