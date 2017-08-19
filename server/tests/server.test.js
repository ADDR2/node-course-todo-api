const { MongoClient, ObjectID } = require("mongodb");
const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

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

beforeEach( done => {
    Todo.remove({}).then( () => {
        return Todo.insertMany(todos);
    }).then( () => done() );
});

describe("POST /todos", () => {
    it("should create a new todo", done => {
        const text = "Test todo text";

        request(app)
            .post("/todos")
            .send({ text })
            .expect(201)
            .expect( response => {
                expect(response.body.text).toBe(text);
            })
            .end( (error, response) => {
                if(error) return done(error);
                const objectResponse = JSON.parse(response.text);

                Todo.find({_id: objectResponse._id}).then( todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                })
                .catch( error => {
                    done(error);
                });
            })

    });

    it("should not create todo with invalid body data", done => {
        request(app)
            .post("/todos")
            .send({})
            .expect(400)
            .end( (error, response) => {
                if(error) return done(error);

                Todo.find().then( todos => {
                    expect(todos.length).toBe(2);
                    done();
                })
                .catch( error => {
                    done(error);
                });
            })
    });
});

describe("GET /todos", () => {
    it("should get all todos", done => {
        request(app)
            .get("/todos")
            .expect(200)
            .expect( response => {
                expect(response.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe("GET /todos/:id", () => {
    it("should return todo doc", done => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect( response => {
                expect(response.body.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it("should return 404 if todo not found", done => {
        request(app)
            .get(`/todos/${(new ObjectID()).toHexString()}`)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("Not found id");
            })
            .end(done);
    });

    it("should return 404 for non-object ids", done => {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("No valid id");
            })
            .end(done);
    });
});

describe("DELETE /todos/:id", () => {
    it("should remove a todo", done => {
        const hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect( response => {
                expect(response.body._id).toBe(hexId);
            })
            .end( (error, response) => {
                if(error) return done(error);

                Todo.findById(hexId).then(
                    todo => {
                        expect(todo).toNotExist();
                        return done();
                    }, err =>  done(err));
            });
    });

    it("should return 404 if todo not found", done => {
        request(app)
            .delete(`/todos/${(new ObjectID()).toHexString()}`)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("Not found id");
            })
            .end(done);
    });

    it("should return 404 for non-object ids", done => {
        request(app)
            .delete(`/todos/123`)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("No valid id");
            })
            .end(done);
    });
});

describe("PATCH /todos/:id", () => {
    it("should update the todo", done => {
        const object = {
            text: "Wait a second",
            completed: true
        };

        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .send(object)
            .expect(200)
            .expect( response => {
                expect(response.body.text).toBe(object.text);
                expect(response.body.completed).toBe(true);
                expect(response.body.completedAt).toBeA("number");
            })
            .end(done);
    });

    it("should clear completedAt when todo is not completed", done => {
        const object = {
            text: "Wait a minute",
            completed: false
        };

        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .send(object)
            .expect(200)
            .expect( response => {
                expect(response.body.text).toBe(object.text);
                expect(response.body.completed).toBe(false);
                expect(response.body.completedAt).toNotExist();
            })
            .end(done);
    });

    it("should return 404 if todo not found", done => {
        request(app)
            .patch(`/todos/${(new ObjectID()).toHexString()}`)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("Not found id");
            })
            .end(done);
    });

    it("should return 404 for non-object ids", done => {
        request(app)
            .patch(`/todos/123`)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("No valid id");
            })
            .end(done);
    });
});