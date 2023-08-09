import express from "express";
import { env } from "node:process";

const PORT = env["PORT"] || 3000;

const app = express();

app.get("/", (_req, res) => {
  return res.send("got it");
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
