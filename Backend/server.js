import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const PORT = 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});