const express = require('express');
const app = express();
const port = 3002;

app.get('/', (req, res) => {
  res.send('Order Management Service');
});

app.listen(port, () => {
  console.log(`Order Management service listening at http://localhost:${port}`);
});
