const express = require('express');
const app = express();
const path = require('path');

const port = 8080;

// serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
