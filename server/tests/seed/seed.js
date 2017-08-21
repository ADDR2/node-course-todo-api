const { MongoClient, ObjectID } = require("mongodb");
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const jwt = require('jsonwebtoken');

const toSign = {
    _id: new ObjectID(),
    access: "auth"
};
const userTwoId = new ObjectID();

const users = [
    {
        _id: toSign._id,
        email: "Amaro@example.com",
        password: "userOnePass",
        tokens: [
            {
                access: toSign.access,
                token: jwt.sign(toSign, 'abc123').toString()
            }
        ]
    },
    {
        _id: userTwoId,
        email: "Duarte@example.com",
        password: "userTwoPass"
    }
];

const todos = [
    {
        _id: new ObjectID(),
        text: "First test todo"
    },
    {
        _id: new ObjectID(),
        text: "Second test todo",
        completed: true,
        completedAt: 123
    }
];

const populateTodos = done => {
    Todo.remove({}).then( () => {
        return Todo.insertMany(todos);
    }).then( () => done() );
};

const populateUsers = done => {
    User.remove({}).then( () => {
        const userOne = new User(users[0]).save();
        const userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    })
    .then( () => done() );
};

module.exports = {
    todos,
    users,
    populateTodos,
    populateUsers
};