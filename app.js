const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
  console.log("connected successfully");
})
.catch(err => {console.log(err)});

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/Public")));

app.get('/',(req,res)=>{
  res.send("hello");
});
//Index Route
app.get("/listings",async (req,res)=>{
const allListing=await Listing.find({})
res.render("./listings/index.ejs",{allListing});
});

//new route
app.get("/listings/new",(req,res)=>
{
  res.render("./listings/new.ejs");
});

//Show Route
app.get("/listings/:id",async(req,res)=>{
  const {id}=req.params;
  const listing=await Listing.findById(id);
  res.render("./listings/show.ejs",{listing});
});

//new route
app.get("/listings/new",(req,res)=>
{
  res.render("./listings/new.ejs");
});

//Create Route
app.post("/listings",async(req,res)=>{
  const newListing=new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

//Edit Route
app.get("/listings/:id/edit",async (req,res)=>{
  const {id}=req.params;
  const listing=await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
});

//Update Route
app.put("/listings/:id/edit",async (req,res)=>{
  const {id}=req.params;
 await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`listings/${id}`);
});

//Delete Route
app.delete("/listings/:id",async(req,res)=>{
   const {id}=req.params;
 let deletedListing= await Listing.findByIdAndDelete(id);
 console.log(deletedListing);
 res.redirect("/listings");
})
// app.get("/testlisting",async (req,res)=>{
//  let sampleListing= new Listing({
//   title:"my home",
//   description:"a small home",
//   price:1300,
//   location:"kathmandu",
//   country:"Nepal",
// });
// await sampleListing.save();
// res.send("Successfully saved");
// });

app.listen(3000,()=>{
  console.log("Sever is running on port 3000");
});