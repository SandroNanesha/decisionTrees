import express from "express";
import routes from "./api/routes.js";

const app = express();
app.use(express.json());

// Mount API routes
app.use("/", routes);

app.get("/", (req, res) => {
  res.send(
    "Decision Tree Processing Backend API - Use POST /execute to process decision trees"
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 All action logs will appear below:\n`);
});
