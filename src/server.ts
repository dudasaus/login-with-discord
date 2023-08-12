import "dotenv/config";
import express from "express";
import { env } from "node:process";
import request from "request";

const PORT = env["PORT"] || 3000;

const app = express();

app.use("/", express.static("./src/static"));

app.get("/", (_req, res) => {
  return res.send("got it!");
});

app.get("/authorize", (req, res) => {
  const { code } = req.query;

  const form = {
    client_id: env["DISCORD_CLIENT_ID"],
    client_secret: env["DISCORD_CLIENT_SECRET"],
    grant_type: "authorization_code",
    code,
    redirect_uri: "http://localhost:3000/authorize",
  };

  request.post(
    "https://discord.com/api/oauth2/token",
    {
      form,
    },
    (err, response, body) => {
      if (!err) {
        res.redirect("/home.html");
      } else {
        res.status(403).send("Unable to login");
      }
    }
  );
});

app.all("*", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
