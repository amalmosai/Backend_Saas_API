import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB, PORT } from "./config/db";

//4_start server
connectDB();
app.listen(PORT, () => {
  console.log(`listen to port ${PORT}`);
});
