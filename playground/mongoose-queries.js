const { MongoClient, ObjectID } = require("mongodb");
const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');

const _id = "59972bf3b73d28900742458611";

if(!ObjectID.isValid(_id))
    console.log("ID not valid");

/*Todo.find({
    _id
}).then( todos => {
    console.log("Todos", todos);
}, error => {
    console.log(error);
});

Todo.findOne({
    _id
}).then( todo => {
    console.log("Todo", todo);
}, error => {
    console.log(error);
});*/

Todo.findById(_id).then( todo => {
    if(!todo) return "Id not found";
    console.log("Todo", todo);
}).catch( error => {
    console.log(error);
});