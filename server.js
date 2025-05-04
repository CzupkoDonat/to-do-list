const express = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const dbName = "list_db";
const collectionName = "lists";

let db;

// Egyszeri adatbázis kapcsolat
MongoClient.connect(process.env.URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
}).then((client) => {
    db = client.db(dbName);
    app.listen(port, () => {
        console.log(`Szerver fut: http://localhost:${port}`);
    });
}).catch((err) => {
    console.error("Nem sikerült csatlakozni a MongoDB-hez:", err);
});

app.get('/lists', async (req, res) => {
    try {
        const lists = await db.collection(collectionName).find().toArray();
        res.json(lists);
    } catch (err) {
        console.error("Hiba a listák lekérdezésekor:", err);
        res.status(500).json({ error: 'Hiba a szerver oldalon' });
    }
});

app.post('/lists', async (req, res) => {
    const list = req.body;

    // Egyszerű validáció
    if (!list.task || typeof list.task !== 'string') {
        return res.status(400).json({ error: 'Érvénytelen vagy hiányzó "task" mező' });
    }

    try {
        await db.collection(collectionName).insertOne({
            task: list.task,
            status: list.status || '',
            date: list.date ? new Date(list.date) : new Date()
        });
        res.status(201).json({ success: true });
    } catch (err) {
        console.error("Hiba a lista hozzáadásakor:", err);
        res.status(500).json({ error: 'Hiba a szerver oldalon' });
    }
});

app.put('/lists/:id', async (req, res) => {
    const listId = req.params.id;
    const updatedList = req.body;

    if (!updatedList.task || typeof updatedList.task !== 'string') {
        return res.status(400).json({ error: 'Érvénytelen vagy hiányzó "task" mező' });
    }

    try {
        const result = await db.collection(collectionName).updateOne(
            { _id: new ObjectId(listId) },
            { $set: updatedList }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ error: 'Nem található a lista' });
        }
    } catch (err) {
        console.error("Hiba a lista frissítésekor:", err);
        res.status(500).json({ error: 'Hiba a szerver oldalon' });
    }
});

app.delete('/lists/:id', async (req, res) => {
    const listId = req.params.id;

    try {
        const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(listId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ error: 'Nem található a lista' });
        }
    } catch (err) {
        console.error("Hiba a lista törlésekor:", err);
        res.status(500).json({ error: 'Hiba a szerver oldalon' });
    }
});
