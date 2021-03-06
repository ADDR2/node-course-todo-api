const { MongoClient, ObjectID } = require("mongodb");
const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const {
    todos,
    users,
    populateTodos,
    populateUsers
} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
    it("should create a new todo", done => {
        const text = "Test todo text";

        request(app)
            .post("/todos")
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect( response => {
                expect(response.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe("GET /todos/:id", () => {
    it("should return todo doc", done => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect( response => {
                expect(response.body.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it("should not return todo doc created by other user", done => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it("should return 404 if todo not found", done => {
        request(app)
            .get(`/todos/${(new ObjectID()).toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("Not found id");
            })
            .end(done);
    });

    it("should return 404 for non-object ids", done => {
        request(app)
            .get(`/todos/123`)
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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

    it("should not remove a todo created by other user", done => {
        const hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end( (error, response) => {
                if(error) return done(error);

                Todo.findById(hexId).then(
                    todo => {
                        expect(todo).toExist();
                        return done();
                    }, err =>  done(err));
            });
    });

    it("should return 404 if todo not found", done => {
        request(app)
            .delete(`/todos/${(new ObjectID()).toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("Not found id");
            })
            .end(done);
    });

    it("should return 404 for non-object ids", done => {
        request(app)
            .delete(`/todos/123`)
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .send(object)
            .expect(200)
            .expect( response => {
                expect(response.body.text).toBe(object.text);
                expect(response.body.completed).toBe(true);
                expect(response.body.completedAt).toBeA("number");
            })
            .end(done);
    });

    it("should not update a todo created by other user", done => {
        const object = {
            text: "Wait a second",
            completed: true
        };

        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .send(object)
            .expect(404)
            .end(done);
    });

    it("should clear completedAt when todo is not completed", done => {
        const object = {
            text: "Wait a minute",
            completed: false
        };

        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("Not found id");
            })
            .end(done);
    });

    it("should return 404 for non-object ids", done => {
        request(app)
            .patch(`/todos/123`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect( response => {
                expect(response.text).toBe("No valid id");
            })
            .end(done);
    });
});

describe("GET /users/me", () => {
    it("should return user if authenticated", done => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect( response => {
                expect(response.body._id).toBe(users[0]._id.toHexString());
                expect(response.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it("should return 401 if not authenticated", done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect( response => {
                expect(response.body).toEqual({});
            })
            .end(done);
    });
});

describe("POST /users", () => {
    it("should create a user", done => {
        const email = "example@example.com";
        const password = "123mnb!";
        
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(201)
            .expect( response => {
                expect(response.headers["x-auth"]).toExist();
                expect(response.body._id).toExist();
                expect(response.body.email).toBe(email);
            })
            .end( error => {
                if(error) return done(error);

                User.findOne({ email }).then(
                    user => {
                        expect(user).toExist();
                        expect(user.password).toNotBe(password);
                        done();
                    }
                )
                .catch( error => done(error));
            });
    });

    it("should return validation errors if request invalid", done => {
        const email = "Hey";
        const password = "23";

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .expect( response => {
                expect(response.body).toEqual({});
            })
            .end(done);
    });

    it("should not create user if email in use", done => {
        const email = users[0].email;
        const password = "userOnePass";

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .expect( response => {
                expect(response.body).toEqual({});
            })
            .end(done);
    });
});

describe("POST /users/login", () => {
    it("should login user and return auth token", done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect( response => {
                expect(response.headers["x-auth"]).toExist();
            })
            .end( (error, response) => {
                if(error) return done(error);

                User.findById(users[1]._id).then(
                    user => {
                        expect(user.tokens[1]).toInclude({
                            access: 'auth',
                            token: response.headers["x-auth"]
                        });
                        done();
                    }
                )
                .catch( error => done(error));
            });
    });

    it("should reject invalid login", done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'hey'
            })
            .expect(400)
            .expect( response => {
                expect(response.headers["x-auth"]).toNotExist();
            })
            .end( (error, response) => {
                if(error) return done(error);

                User.findById(users[1]._id).then(
                    user => {
                        expect(user.tokens.length).toBe(1);
                        done();
                    }
                )
                .catch( error => done(error));
            });
    });
});

describe("DELETE /users/me/token", () => {
    it("should remove auth token on logout", done => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end( (error, response) => {
                if(error) return done(error);

                User.findById(users[0]._id).then(
                    user => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    }
                )
                .catch( error => done(error));
            });
    });
});