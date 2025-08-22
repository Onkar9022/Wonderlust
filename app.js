const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// ----------------- Connect to MongoDB -----------------
mongoose.connect(MONGO_URL)
  .then(() => console.log("Mongoose is connected"))
  .catch(err => console.error("Problem connecting to database:", err));

// ----------------- App Config -----------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ----------------- Routes -----------------

// Root route
app.get("/", (req, res) => {
  res.send("Hi, I'm the root");
});

// ----------- Listings Routes -----------

// 1️⃣ New Listing (specific route)
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// 2️⃣ Edit Listing (specific route)
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/edit", { listing });
}));

// 3️⃣ Index (all listings)
app.get("/listings", wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { listings });
}));

// 4️⃣ Show Listing
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/show", { listing });
}));

// 5️⃣ Create Listing
app.post("/listings", wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// 6️⃣ Update Listing
app.put("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

// 7️⃣ Delete Listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

// ----------------- 404 Handler -----------------
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ----------------- Error Handler -----------------
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode);
  res.render("error", { statusCode, message, err });
});
// ----------------- Server -----------------
app.listen(8080, () => {
  console.log("Server is started on port 8080");
});
