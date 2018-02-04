'use strict';

const express = require('express');
const nconf = require('nconf');

const productRepo = require('./repos/product.repo');


nconf.argv().env().file('conf.json').defaults({
  PORT: 3000,
  googleCloud: {
    credentials: undefined,
    maxConcurrency: {
      vision: 5
    }
  },
  repo: {
    fs: {
      persistDelay: 50,
      filePath: '/tmp/testGoogleVision.repo.json'
    }
  }
});

async function configureProductRepo() {
  console.time('noteRepo.reloadAll');
  await productRepo.init();
  console.timeEnd('noteRepo.reloadAll');
}


Promise.all([configureProductRepo()]).then(() => {

  const app = express();
  app.use('/api/private', require('./routes/api.private.route'));
  app.use('/api/public', require('./routes/api.public.route'));
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    next(err);
  });
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({error: "Something broke!"});
  });
  app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
  });
  app.listen(nconf.get('PORT'), () => {
    console.log('web server started');
  });

}).catch((err) => {
  console.error('could not init app', err);
});