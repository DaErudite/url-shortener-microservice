require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose= require('mongoose');
const Url=require('./urlModel');
const shortid=require('shortid');

const dns=require('dns')

const bodyParser=require('body-parser')

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json())



const mySecret = process.env['dbURI']
mongoose.connect(mySecret,{ useNewUrlParser: true, useUnifiedTopology: true })
.then((result)=> console.log('mongoose connect success'))
.catch((error)=> console.log('mongoose error occurred'));


const port = process.env.PORT || 3000;
app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

var urlForDns =(url)=> {
  let urlToDsn;  
  let urlProtocol = url.split('//')[0];
  if (urlProtocol == "https:"|| urlProtocol=="http:") {
    let address = url.split('//')[1];
    address = address.split('/')[0];
    let domain = address.replace("www.", "");
    urlToDsn= domain; 
  } else {
    urlToDsn= "invalid";
  }
    return urlToDsn;
}


//Input
app.post('/api/shorturl',(req, res)=> {
  var url = req.body.url;  
  console.log(req.body.url)
  var urlDns = urlForDns(url); 
  var shortcode= shortid.generate();
  dns.lookup(urlDns, (err) => {
    if (err) {
        res.json({
          error: 'invalid url'        
        })
    } else {
      var NewUrl = new Url({
        url,
        shortcode
      });
      NewUrl.save(function(err, data){
        if(err) return res.json({
          error: 'save failed'
        });
        else return res.json({
          original_url: url, short_url: shortcode
        });
      })
    }
  })      
});

app.get('/api/shorturl/:shortcode', (req,res)=>{
  var shortcode= req.params.shortcode;
  Url.findOne({"shortcode":shortcode},(err,url)=>{
    if(err) res.send({err:'error redirecting'})
    else res.redirect(url.url);
  })
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

