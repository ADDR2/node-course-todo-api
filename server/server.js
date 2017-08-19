require('./config/config');

const _ = require("lodash");
const { MongoClient, ObjectID } = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save().then( doc => {
        res.status(201).send(doc);
    }, (error) => {
        res.status(400).send(error);
    });
});

app.get('/todos', (req, res) => {

    Todo.find().then( todos => {
        res.status(200).send({todos});
    }, (error) => {
        res.status(400).send(error);
    });
});

app.get('/todos/:id', (req, res) => {
    const { id } = req.params;

    if(!ObjectID.isValid(id))
        res.status(404).send("No valid id");
    else{
        Todo.findById(id).then( todo => {
            if(!todo) res.status(404).send("Not found id");
            else res.status(200).send(todo);
        }, (error) => {
            res.status(400).send(error);
        });
    }
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;

    if(!ObjectID.isValid(id))
        res.status(404).send("No valid id");
    else{
        Todo.findByIdAndRemove(id).then( todo => {
            if(!todo) res.status(404).send("Not found id");
            else res.status(200).send(todo);
        }, (error) => {
            res.status(400).send(error);
        });
    }
});

app.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const body = _.pick(req.body, ["text", "completed"]);

    if(!ObjectID.isValid(id))
        return res.status(404).send("No valid id");

    if(_.isBoolean(body.completed) && body.completed)
        body.completedAt = new Date().getTime();
    else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then( todo => {
        if(!todo) res.status(404).send("Not found id");
        else res.status(200).send(todo);
    }, (error) => {
        res.status(400).send(error);
    });
});

app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`);
});

module.exports = {
    app
};