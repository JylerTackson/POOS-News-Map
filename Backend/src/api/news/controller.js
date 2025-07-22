//Create instance of express
import express from "express";
const router = express.Router();

// src/api/dailyNews/service.js
import NewsAPI from "newsapi";
import mongoose from "mongoose";

// mongoose schema
import { dailyNewsSchema } from "../../Mongoose/schemas.js";

//Dot Connection
import dotenv from "dotenv";
dotenv.config();
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

//Countrys KVP
const countryMap = {
  ae: "United Arab Emirates",
  ar: "Argentina",
  at: "Austria",
  au: "Australia",
  be: "Belgium",
  bg: "Bulgaria",
  br: "Brazil",
  ca: "Canada",
  ch: "Switzerland",
  cn: "China",
  co: "Colombia",
  cu: "Cuba",
  cz: "Czech Republic",
  de: "Germany",
  eg: "Egypt",
  fr: "France",
  gb: "United Kingdom",
  gr: "Greece",
  hk: "Hong Kong",
  hu: "Hungary",
  id: "Indonesia",
  ie: "Ireland",
  il: "Israel",
  in: "India",
  it: "Italy",
  jp: "Japan",
  kr: "South Korea",
  lt: "Lithuania",
  lv: "Latvia",
  ma: "Morocco",
  mx: "Mexico",
  my: "Malaysia",
  ng: "Nigeria",
  nl: "Netherlands",
  no: "Norway",
  nz: "New Zealand",
  ph: "Philippines",
  pl: "Poland",
  pt: "Portugal",
  ro: "Romania",
  rs: "Serbia",
  ru: "Russia",
  sa: "Saudi Arabia",
  se: "Sweden",
  sg: "Singapore",
  si: "Slovenia",
  sk: "Slovakia",
  th: "Thailand",
  tr: "Turkey",
  tw: "Taiwan",
  ua: "Ukraine",
  us: "United States",
  ve: "Venezuela",
  za: "South Africa",
};

async function fetchAndStoreNews() {
  //retrieve sources from newsapi
  const { sources } = await newsapi.v2.sources({ language: "en" });

  const sourceCountry = sources.reduce((m, s) => {
    m[s.id] = s.country;
    return m;
  }, {});
  const allIds = sources.map((s) => s.id).join(",");

  const { articles } = await newsapi.v2.topHeadlines({
    sources: allIds,
    pageSize: 100,
  });

  console.log(articles);

  // 2) transform into plain JS objects matching your schema
  const docs = articles.map((a) => ({
    country: sourceCountry[a.source.id] || null,
    headline: a.title,
    body: a.description || a.content || "",
    date: new Date(a.publishedAt),
    source: a.source.name,
    url: a.url,
    urlToImage: a.urlToImage,
    favorite: false,
  }));

  // 3) insert into mongodb
  try {
    //create the model:
    const DailyNews = mongoose.model("DailyNews", dailyNewsSchema, "DailyNews");

    //Delete previous days news
    await DailyNews.deleteMany({});

    //Insert Todays news
    const inserted = await DailyNews.insertMany(docs, { ordered: false });

    console.log(`Inserted ${docs.length} documents`);
  } catch (err) {
    // ordered:false lets it skip duplicates/errors and continue
    console.error("some docs failed to insert", err);
  }
}

  //Return all daily news articles
  async function showDaily(req, res) {
  //Create model that connects to the collection
  const DailyNews = mongoose.model("dailyNews", dailyNewsSchema, "DailyNews");

  try {
    //return all items within that collection
    const articles = await DailyNews.find();
    res.status(200).json(articles);
  } catch (err) {
    //report error
    res.status(500).json({ error: err.message });
  }
}

//Return all news articles given a country
async function searchByCountry(req, res) {
  const DailyNews = mongoose.model("DailyNews", dailyNewsSchema, "DailyNews");

  try {
    const articles = await DailyNews.find({ country: req.params.country });
    res.status(200).json(articles); // ADD THIS LINE - it was missing!
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/news/country-from-coords/:lat/:lng
async function getCountryFromCoordinates(req, res) {
  try {
    const { lat, lng } = req.params;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=3&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NewsMap/1.0 (school project)'
        }
      }
    );
    
    const data = await response.json();
    
    if (data.address?.country) {
      res.json({ country: data.address.country });
    } else {
      res.json({ country: null });
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: "Failed to get country" });
  }
}

export { fetchAndStoreNews, showDaily, searchByCountry, getCountryFromCoordinates };
