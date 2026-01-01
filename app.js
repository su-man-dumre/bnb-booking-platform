const express= require('express');
const app= express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema} = require('./schema.js');

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
  console.log("connected to db");
}).catch((err)=>{
  console.log(err);
});
async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,'/public')));


app.get('/',(req,res)=>{
  res.send("hi there");
});
const validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
 
  if(error){
    
    throw new ExpressError(400,error.details.map((el)=>el.message).join(","));
  }else{
    next();
  }
};
//index route to show all listings
app.get('/listings',async(req,res)=>{
  const allListings= await Listing.find({})
  res.render("./listings/index.ejs",{allListings});
});

//new route
app.get('/listings/new',(req,res)=>{
  res.render("./listings/new.ejs");
});

//show route
app.get('/listings/:id',wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/show.ejs",{listing});
}));

//create route
app.post('/listings',validateListing,wrapAsync(async(req,res,next)=>{
  let result=listingSchema.validate(req.body);
  console.log(result);
  if(result.err){
    throw new ExpressError(400,result.err);
  }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

//edit route
app.get('/listings/:id/edit',wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
}));

//update route
app.put('/listings/:id',validateListing,wrapAsync(async(req,res)=>{
  
  const {id} = req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//delete route
app.delete('/listings/:id',wrapAsync(async(req,res)=>{
  const {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect('/listings');
}));

// app.get('/testlistings' ,async(req,res)=>{
//   let sampleListing= new Listing({
//     title:"Porche 911",
//     description:"A beautiful sports car",
//     price:150000,
//     location:"Pokhara",
//     country:"Nepal"
//   });
//   await sampleListing.save();
//   res.send("Listing saved");
//   console.log("successfully saved");
// });

app.use((req,res,next)=>{
  next(new ExpressError(404,"page not found"));
});


app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});


app.listen(3000,()=>{
  console.log("Server is running on port 3000");
});