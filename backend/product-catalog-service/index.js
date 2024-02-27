const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Product Catalog Service');
});

app.listen(port, () => {
  console.log(`Product Catalog service listening at http://localhost:${port}`);
});
