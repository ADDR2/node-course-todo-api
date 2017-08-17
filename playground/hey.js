const a = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log(2);
    resolve(2);
  }, 2000);
});

const b = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log(3);
    resolve(3);
  }, 2000);
});

const array = [];

array.push(a);
array.push(b);

Promise.all(array).then(
  results => {
    console.log(results);
  },
  error => {
    console.log(error);
  }
);
