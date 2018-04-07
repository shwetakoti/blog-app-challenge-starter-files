const mongoose = require('mongoose') ;

const blogAppSchema = mongoose.Schema({
  title:{type: String, required:true},
  content:{type: String},
  author:{
    firstName:String,
    lastName:String
  },
  created:{type:Date,default:Date.now}
});

//virtual method
blogAppSchema.virtual('authorName').get(function(){
  return `${this.author.firstName} ${this.author.lastName}`});

//serialize method
blogAppSchema.methods.serialize = function(){
    return{
      id:this._id,
      title:this.title,
      content:this.content,
      author:this.authorName,
      created:this.created
    };
  };

  const blogApp = mongoose.model('Blogapp',blogAppSchema,'blogapp');

  module.exports = {blogApp};
