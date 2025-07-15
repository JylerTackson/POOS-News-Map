// This file contains the routes for the server.
// AKA this file defines the basic CRUD operations for the records collection in the MongoDB database.

import express from 'express';

//connect to the database
import db from '../db/connection.js';
import { ObjectId } from 'mongodb';

// router is an instance of the Express Router class.
// It is used to define routes for handling requests to the server.
const router = express.Router();

// ---------------------------------------------------READ-------------------------------------------------------
// -----------------------------------------------GET REQUESTS---------------------------------------------------

//A record in MongoDB is a document, which is a data structure composed of field and value pairs.
// To retrieve a list of all the records, we define a GET route at the root path ('/').
router.get('/', async (req, res) => {
    // accesses the records collection in the db and pauses the execution until the operation is complete.
    let collection = await db.collection('records');
    // runds a query to final all docuements with the given filter, currently no filter.
    let results = await collection.find({}).toArray();
    // sends the results back to the client with a 200 OK status.
    res.send(results).status(200);
});


// To retrieve a specific record by its ID, we define a GET route at the path '/:id'.
router.get('/:id', async (req, res) => {
    let collection = await db.collection('records');
    // Generate an ObjectId from the ID paramter within the request.
    // MongoDB uses ObjectID as unique identifiers at the path /records/:id.
    let query = { _id: new ObjectId(req.params.id) };

    // Find the document that matches the Id.
    let results = await collection.findOne(query);

    if(!results) res.send("ID Not Found").status(404);
    else res.send(results).status(200);
});

// --------------------------------------------------CREATE------------------------------------------------------
// -----------------------------------------------POST REQUESTS--------------------------------------------------

// Create a new record by defining a POST route at the root path ('/').
router.post('/', async (req, res) => {
    try{
        //Create a new document with the data from the request body.
        let newDocument = {
            name: req.body.name,
            position: req.body.position,
            level: req.body.level,
        }

        let collection = await db.collection("records");
        let result = await collection.insertOne(newDocument);
        //204 indicates successful request with no content to return.
        res.send(result).status(204);

    }catch (error) {
        console.error("Error creating new record:", error);
        res.status(500).send("Internal Server Error");
    }
});

// --------------------------------------------------UPDATE------------------------------------------------------
// -----------------------------------------------PATCH REQUESTS--------------------------------------------------

// Update an existing record by defining a PATCH route at the path '/:id'.
router.patch("/:id", async (req, res) => {
    try{
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                name: req.body.name,
                position: req.body.position,
                level: req.body.level
            },
        };

        let collection = await db.collection("records");
        let result = await collection.updateOne(query, updates);
        //204 indicates successful request with no content to return.
        res.send(result).status(204);
    } catch (error) {
        console.error("Error updating record:", error);
        res.status(500).send("Internal Server Error");
    }
});

// --------------------------------------------------DELETE------------------------------------------------------
// ----------------------------------------------DELETE REQUESTS-------------------------------------------------

// Delete a record by defining a DELETE route at the path '/:id'.
router.delete("/:id", async (req, res) => {
    try{
        const query = {_id: new ObjectId(req.params.id)};
        const collection = await db.collection("records");
        let result = await collection.deleteOne(query);
        //204 indicates successful request with no content to return.
        res.send(result).status(204);
    }catch (error) {
        console.error("Error deleting record:", error);
        res.status(500).send("Internal Server Error");
    }

});

export default router;