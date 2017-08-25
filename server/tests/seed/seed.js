const { MongoClient, ObjectID } = require("mongodb");
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const jwt = require('jsonwebtoken');

const toSign = {
    _id: new ObjectID(),
    access: "auth"
};
const userTwoId = new ObjectID();

const toSign2 = {
    _id: userTwoId,
    access: "auth"
};

const users = [
    {
        _id: toSign._id,
        email: "Amaro@example.com",
        password: "userOnePass",
        tokens: [
            {
                access: toSign.access,
                token: jwt.sign(toSign, process.env.JWT_SECRET).toString()
            }
        ]
    },
    {
        _id: userTwoId,
        email: "Duarte@example.com",
        password: "userTwoPass",
        tokens: [
            {
                access: toSign2.access,
                token: jwt.sign(toSign2, process.env.JWT_SECRET).toString()
            }
        ]
    }
];

const todos = [
    {
        _id: new ObjectID(),
        text: "First test todo",
        _creator: toSign._id
    },
    {
        _id: new ObjectID(),
        text: "Second test todo",
        completed: true,
        completedAt: 123,
        _creator: userTwoId
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