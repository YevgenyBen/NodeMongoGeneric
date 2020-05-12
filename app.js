const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const app = express();

app.use(cors());
app.use(bodyParser.json());

/*
Generic entity in config.js
currently contacts
*/

MongoClient.connect(config.db.host, { useUnifiedTopology: true }, (err, dbHandler) => {


    if (err) {
        console.log('Could not connect to Database');
        throw err;
    }

    const db = dbHandler.db(config.db.name);

    //get all entities
    app.get(`/${config.entity}`, (req, res) => {

        db.collection(config.entity).find().toArray((err, contacts) => {

            if (err) {
                res.send({
                    success: false,
                    err: 'Could not read data from database'
                });
            }
            else {
                res.send({
                    success: true,
                    data: contacts
                });
            }
        });
    });

    //get one by id
    app.get(`/${config.entity}/:id`, (req, res) => {

        let entityId = req.params.id;

        if (entityId.length < 12) {
            res.send({
                success: false,
                err: 'Invalid id'
            });
            return;
        }

        db.collection(config.entity).findOne({
            _id: ObjectId(entityId)
        }, (err, result) => {

            if (err) {
                res.send({
                    success: false,
                    err: 'Could not get data'
                });
            }
            else {
                res.send({
                    success: true,
                    data: result
                });
            }
        });
    })

    //add entity
    app.post(`/${config.entity}`, (req, res) => {

        let ent = req.body;
        console.log("add user: ", ent)

        {
            db.collection(config.entity).insertOne(ent, (err, result) => {

                if (err) {
                    res.send({
                        success: false,
                        err: 'Could not add entity'
                    });
                }
                else {
                    res.send({
                        success: true,
                        data: {
                            data: result
                        }
                    });
                }
            })
        }
    });

    //update one
    app.put(`/${config.entity}`, (req, res) => {

        let ent = req.body;

        /**
         * validation
         */

        // if(contact.name === undefined || contact._id === undefined) {
        //     res.send({
        //         success: false,
        //         err: 'Contact details are missing, must provide a name and an id'
        //     });
        // }
        // else 

        {
            ent._id = ObjectId(ent._id);     //  conver id to ObjectId

            db.collection(config.entity).updateOne({
                _id: ent._id
            }, {
                $set: { ...ent }
            }, (err, result) => {
                if (err) {
                    res.send({
                        success: false,
                        err: 'Could not update'
                    })
                }
                else {
                    res.send({
                        success: true,
                        rowsAffected: result.result.nModified
                    })
                }
            })
        }
    })

    //delete one
    app.post(`/${config.entity}/delete`, (req, res) => {
        let ent = req.body;
        /**
         * validation
         */

        // if(contact.name === undefined || contact._id === undefined) {
        //     res.send({
        //         success: false,
        //         err: 'Contact details are missing, must provide a name and an id'
        //     });
        // }
        // else 

        ent._id = ObjectId(ent._id);

        db.collection(config.entity).removeOne(
            {
                _id: ent._id
            },
            (err, result) => {
                if (err) {
                    res.send({
                        success: false,
                        err: 'Could not delete'
                    })
                }
                else {
                    res.send({
                        success: true,
                        rowsAffected: result.result.nModified
                    })
                }
            }
        )

    })

    app.listen(config.port, () => {
        console.log(`Server started at port ${config.port}`);
    })
})