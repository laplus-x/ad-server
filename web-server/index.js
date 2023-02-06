require("./global_constant");
require("./global_function");

const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ limit: "300mb" }));
app.use(bodyParser.urlencoded({ limit: "300mb", extended: true }));

app.use(cookieParser(config.cookieSecret));
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    resave: false,
    saveUninitialized: false,
    secret: config.sessionSecret,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    unset: "destroy",
  })
);

const routes = require("./routes/index.js");

app.use("/api", routes);

// error handling
app.use((err, req, res, next) => {
  console.error(err);
  if (err.isBoom) {
    return res.status(err.output.statusCode).json(err.output.payload);
  } else {
    return res.status(err.statusCode).json({ error: err.message });
  }
});

const port = config.api_server_port || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
