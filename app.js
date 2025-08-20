const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
  .then(() => console.log("Mongoose is connected"))
  .catch(err => console.error("Problem connecting to database:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));


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
//show route

const { Types } = require("mongoose");
    app.get("/listings/api", async (req, res) => {
    try {
        let { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid listing ID format");
        }

        const listing = await Listing.findById(id);

        if (!listing) {
        return res.status(404).send("Listing not found in MongoDB");
        }

        // render show.ejs
        res.render("listings/show", { listing });
    } catch (err) {
        console.error("Error fetching listing:", err);
        res.status(500).send("Server error");
    }
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

app.listen(8080, () => {
  console.log("Server is started on port 8080");
});
