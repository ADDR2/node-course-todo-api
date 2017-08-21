const { SHA256 } = require('crypto-js');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const password = '123abc!';

bcrypt.genSalt(10, (error, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});

const hashedPassword = '$2a$10$43i2hyXVyBAhvdyTJLAphOkV.Aru8citmWSYEqpQ.8.Moj3R1fo5C';

bcrypt.compare(password, hashedPassword, (error, response) => {
    console.log(response);
});


// const data = {
//     id: 10
// };

// const token = jwt.sign(data, "123abc");
// console.log(token);

// const decoded = jwt.verify(token, "123abc");
// console.log(decoded);

// const message = "I am user number 3";
// const hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// const data = {
//     id: 4
// };

// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + "somesecret").toString()
// };

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// const resultHash = SHA256(JSON.stringify(token.data) + "somesecret").toString();

// if(token.hash === resultHash){
//     console.log("Data was not changed");
// } else {
//     console.log("Data was changed. Do not trust!");
// }