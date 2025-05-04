
const express = require('express');
const mongodb = require('mongodb');
require('dotenv').config()

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const MongoClient = mongodb.MongoClient;
const dbName = "list_db";
const collectionName = "lists";

app.get('/lists', (req, res) => {
    MongoClient.connect(process.env.URI, {})
        .then((client) => {
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.find().toArray()
                .then((lists) => {
                    res.json(lists);
                })
                .catch((err) => {
                    console.error("Hiba az lista lekérdezésekor: " + err);
                    res.status(500).json({ error: 'Hiba a szerver oldalon' });
                })
                .finally(() => {
                    client.close();
                });
        })
        .catch((err) => {
            console.error("Hiba a MongoDB-hez csatlakozáskor: " + err);
            res.status(500).json({ error: 'Hiba a szerver oldalon' });
        });
});

app.post('/lists', (req, res) => {
    const list = req.body;

    MongoClient.connect(process.env.URI, {})
        .then((client) => {
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.insertOne(list)
                .then((result) => {
                    res.status(201).json({ succes: true });
                })
                .catch((err) => {
                    console.error("Hiba a listára hozzáadásakor: " + err);
                    res.status(500).json({ error: 'Hiba a szerver oldalon' });
                })
                .finally(() => {
                    client.close();
                });
        })
        .catch((err) => {
            console.error("Hiba a MongoDB-hez csatlakozáskor: " + err);
            res.status(500).json({ error: 'Hiba a szerver oldalon' });
        });
});

app.put('/lists/:id', (req, res) => {
    const listId = req.params.id;
    const updatedList = req.body;

    MongoClient.connect(process.env.URI, {})
        .then((client) => {
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.updateOne(
                { _id: new mongodb.ObjectId(listId) },
                { $set: updatedList }
            ).then((result) => {
                if (result.modifiedCount === 1) {
                    return res.status(200).json({ success: true });
                } else {
                    return res.status(404).json({ error: 'Nem található a listád' });
                }
            })
                .catch((err) => {
                    console.error("Hiba a listát frissítésénél: " + err);
                    res.status(500).json({ error: 'Hiba a szerver oldalon' });
                })
                .finally(() => {
                    client.close();
                });
        })
        .catch((err) => {
            console.error("Hiba a MongoDB-hez csatlakozáskor: " + err);
            res.status(500).json({ error: 'Hiba a szerver oldalon' });
        });
});

app.delete('/lists/:id', (req, res) => {
    const listId = req.params.id;

    MongoClient.connect(process.env.URI, {})
        .then((client) => {
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            collection.deleteOne({ _id: new mongodb.ObjectId(listId) })
                .then((result) => {
                    if (result.deletedCount === 1) {
                        return res.status(200).json({ success: true });
                    } else {
                        return res.status(404).json({ error: 'Nem található a listád' });
                    }
                })
                .catch((err) => {
                    console.error("Hiba a listát törölésénél: " + err);
                    res.status(500).json({ error: 'Hiba a szerver oldalon' });
                })
                .finally(() => {
                    client.close();
                });
        })
        .catch((err) => {
            console.error("Hiba a MongoDB-hez csatlakozáskor: " + err);
            res.status(500).json({ error: 'Hiba a szerver oldalon' });
        });
});


app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port} porton!`);
});