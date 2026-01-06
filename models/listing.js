const mongoose =require("mongoose");
const Schema=mongoose.Schema;

 const listingSchema=new Schema({
  title:{
type:String,
  required: true
},
  description:String,
//   image:{
// type:String,
// default:"https://unsplash.com/photos/ornate-red-gate-in-a-bustling-indian-city-Jj1S6YjvUR0",
//   set:(v)=>v==="" ? "https://unsplash.com/photos/ornate-red-gate-in-a-bustling-indian-city-Jj1S6YjvUR0":v,
// },
image:{
  filename:String,
  url:String,

},
  
  price: {
  type: Number,
  default: 0
},
reviews:[{
  type:Schema.Types.ObjectId,
  ref:"Review",
 }
],

 });

 const Listing=mongoose.model("Listing",listingSchema);
 module.exports=Listing;