'use strict';

const express = require('express');
const nconf = require('nconf');

nconf.argv().env().file('conf.json').defaults({
    PORT: 3000
});


const app = express();
app.use(function (err, req, res, next) {
    console.error(err.stack);
    next(err);
});
app.use(function (err, req, res, next) {
    res.status(500).send({error: err.message});
});
app.listen(nconf.get('PORT'), () => {
    console.log('web server started');
});