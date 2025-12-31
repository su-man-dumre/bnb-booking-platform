const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/expressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// ------------------- App Config -------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "Public")));

// ------------------- ROUTES -------------------

// Home
app.get("/", (req, res) => {
  res.send("Hello, Wanderlust App!");
});

// New Route (must be BEFORE /:id)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
}));

// Create Route
app.post("/listings", wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Page Not Found");
  res.render("listings/show.ejs", { listing });
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Page Not Found");
  res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (!listing) throw new ExpressError(404, "Page Not Found");
  res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) throw new ExpressError(404, "Page Not Found");
  res.redirect("/listings");
}));

// ------------------- 404 Handler -------------------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ------------------- Error Handling Middleware -------------------
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (statusCode === 404) {
    return res.status(404).render("error.ejs", { message });
  }
  res.status(statusCode).send(message);
});

// ------------------- SERVER -------------------
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
