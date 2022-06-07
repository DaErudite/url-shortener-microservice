const mongoose=require('mongoose')


const UrlSchema=new mongoose.Schema({
  url: String,
  shortcode: String
})
module.exports = mongoose.model('Url', UrlSchema);