
import "reflect-metadata";
import "dotenv/config";

import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("MySQL connected successfully through TypeORM!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
