const { MongoClient, ObjectID } = require("mongodb");
const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// To remove everything

// Todo.remove({}).then(
//     response => {
//         console.log(response);
//     }, error => {
//         console.log(error);
//     }
// );

Todo.findByIdAndRemove("5998ac3896accc380ffb82fe").then(
    todo => {
        console.log(todo);
    }, error => {
        console.log(error);
    }
);