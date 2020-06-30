const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const artistsRouter = require('./routers/artistsRouter');
const usersRouter = require('./routers/adminRouter');
const cors = require('cors');
const path = require('path');

app.use("/images", express.static(path.join('images')));

app.use(cors());
app.use(bodyParser.json());

app.use('/api/artists', artistsRouter);
app.use('/api/users', usersRouter);

module.exports = app;