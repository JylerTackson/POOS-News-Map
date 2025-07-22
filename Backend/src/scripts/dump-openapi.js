import fs from "fs";
import { swaggerSpec } from "../swagger/swagger.js";

fs.writeFileSync("openapi.json", JSON.stringify(swaggerSpec, null, 2));
console.log("✅ Wrote openapi.json");
