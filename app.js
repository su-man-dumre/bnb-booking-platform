const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
  console.log("Connected to DB");
}).catch(err => {
  console.log(err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

// App Config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Validation Middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details.map(el => el.message).join(","));
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details.map(el => el.message).join(","));
  } else {
    next();
  }
};

// Routes
app.get('/', (req, res) => {
  res.send("Hi there");
});

// INDEX - show all listings
app.get('/listings', wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// NEW listing form
app.get('/listings/new', (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE listing
app.post('/listings', validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// SHOW listing
app.get('/listings/:id', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate('reviews');
  res.render("listings/show.ejs", { listing });
}));

// EDIT listing form
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// UPDATE listing
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

// DELETE listing
app.delete('/listings/:id', wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect('/listings');
}));

// CREATE review
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  await newReview.save();

  // Push review ID to the listing
  listing.reviews.push(newReview._id);
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

// DELETE a review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  // Remove review reference from Listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Delete the review document
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}));

// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
