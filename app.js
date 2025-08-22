const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

main()
  .then(() => console.log("Mongoose is connected"))
  .catch(err => console.error("Problem connecting to database:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi, I'm the root");
}) ;


//index route
app.get("/listings", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", {listings}); // send back all listings
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching listings");
  }
});
//new route
app.get("/listings/new",(req , res)=>{
  res.render("listings/new");
})
//show route

  app.get("/listings/:id", async (req, res) => {
  try {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid listing ID format");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).send("Listing not found in MongoDB");
    }

    res.render("listings/show", { listing });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//create route
app.post("/listings", wrapAsync(async (req, res ,next) => {
  
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
 
}));
//edit route
app.get("/listings/:id/edit",async(req, res)=>{
   let { id } = req.params;
   const listing = await Listing.findById(id);
   res.render("listings/edit", {listing});

})

//update route
app.put("/listings/:id", async (req ,res)=>{
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id , {...req.body.listing});
  res.redirect(`/listings/${id}`);
});
//delete 
app.delete("/listings/:id", async(req, res)=>{
  let {id} = req.params;
let deleted =  await Listing.findByIdAndDelete(id);
res.redirect("/listings");
});

// For testing DB insert
// app.get("/testlisting", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "my new home",
//     description: "by the beach",
//     price: 1200,
//     location: "pune",
//     country: "india",
//   });

//   await sampleListing.save();
//   console.log("Sample was saved");
//   res.send("Successful testing");
// });
// ✅ your routes go here

// ------------------ ROUTES ABOVE ------------------

// Catch-all for 404 (must be AFTER all routes)
app.use((req, res, next) => {
  console.log("404 middleware reached:", req.originalUrl); // debug log
  next(new ExpressError(404, "Page Not Found"));
});

// Error-handling middleware (must be LAST)
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

// Start server
app.listen(8080, () => {
  console.log("Server is started on port 8080");
});



app.listen(8080, () => {
  console.log("Server is started on port 8080");
});
