const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (error, db) => {
  if (error) return console.log("Unable to connect to MongoDB server");

  console.log("Connected to MongoDB server");

  db.collection('Users').findOneAndUpdate({
      _id: new ObjectID('5977e1f48cd229271497c0fe')
  }, {
      $set: {
          location: 'Miranda'
      },
      $inc: {
          age: 4
      }
  },{
      returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

  //db.close();
});
