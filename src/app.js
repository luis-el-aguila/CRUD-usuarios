const express = require("express");
const userRoutes = require("./routes/userRoutes");
const logger = require("./middleware/logger");

const app = express();

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("user API width firebase is running");
});

app.use("/users", userRoutes);

module.exports = app;
