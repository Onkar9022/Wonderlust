const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";


main()
  .then(() => console.log("Mongoose is connected"))
  .catch(err => console.error("Problem connecting to database:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
};

const initDB = async () =>{
  await  Listing.deleteMany({})
  await Listing.insertMany(initData.data);
  console.log("Data was initialized")
}; 
initDB();
