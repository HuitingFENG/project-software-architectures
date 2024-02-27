const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('User Service');
});

app.listen(port, () => {
  console.log(`User service listening at http://localhost:${port}`);
});
