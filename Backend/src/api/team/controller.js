import mongoose from "mongoose";

import { teamSchema } from "../../Mongoose/schemas.js";

async function retrieveTeamInfo(req, res) {
  //Create model that connects to the collection
  const TeamInfo = mongoose.model("TeamInfo", teamSchema, "TeamInfo");

  try {
    //return all items within that collection
    const articles = await TeamInfo.find();
    res.status(200).json(articles);
  } catch (err) {
    //report error
    res.status(500).json({ error: err.message });
  }
}

export { retrieveTeamInfo };
