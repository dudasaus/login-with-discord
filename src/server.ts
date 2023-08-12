import "dotenv/config";
import express from "express";
import { env } from "node:process";
import request from "request";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const PORT = env["PORT"] || 3000;

const app = express();
app.use(cookieParser());

app.get("/login", (req, res) => {
  return res.sendFile("./login.html", {
    root: "./src/static",
  });
});

app.get("/home", (req, res) => {
  const v = jwt.verify(
    req.cookies.auth,
    env["JWT_PRIVATE_KEY"],
    (err, decoded) => {
      if (err) {
        res.redirect("/login");
      } else {
        console.log(decoded);
        res.send(`Logged in as ${decoded.username}`);
      }
    }
  );
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
    async (err, response, body) => {
      if (!err) {
        const bodyObj = JSON.parse(body);
        const discordToken = bodyObj.access_token;
        const user = await getDiscordUser(discordToken);
        const authPayload = { discordToken, username: user["username"] };
        res.cookie("auth", jwt.sign(authPayload, env["JWT_PRIVATE_KEY"]), {
          maxAge: 1000 * 60 * 60, // 1 hr
        });
        res.redirect("/home");
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

async function getDiscordUser(token: string) {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: "https://discord.com/api/users/@me",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          const bodyObj = JSON.parse(body);
          console.log(bodyObj);
          resolve(bodyObj);
        }
      }
    );
  });
}
