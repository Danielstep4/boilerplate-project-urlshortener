require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns')

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const Url = mongoose.model('Url', { url: String, num: Number })
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/new', (req, res) => {
    dns.lookup(req.body.url, (err) => {
        if(err) throw err
        else {
            const newUrl = new Url({ url: req.body.url, num: +process.env.COUNT })
            newUrl.save().then(() => {
                console.log('URL Saved in the db')
                res.json({  
                  original_url: req.body.url,
                  short_url: +process.env.COUNT
              })
                process.env.COUNT++
              }).catch(err => {
                  console.log(err)
                  res.json({error: 'Invalid Hostname'})
              })
        }
    })
});
app.get('/api/shorturl/:id', function(req, res) {
  Url.find({ num: req.params.id }, (err, url) => {
    if(err) return console.log(err)
  }).then((url) => {
      const myUrl = url[0].url
      res.redirect(myUrl)
  }).catch(err => {
      console.log(err)
      res.json({error: 'No short URL found for the given input'})
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
