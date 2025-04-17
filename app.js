require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("./config/passport-config");

const indexRouter = require("./routes/dashboard");
const authRouter = require("./routes/auth");
const restaurantsRouter = require("./routes/restaurant");
const profileRoutes = require("./routes/profile");
const menuRoutes = require("./routes/menus");
const dishRoutes = require("./routes/dishes");
const homeRoutes = require("./routes/home");
const usersRouter = require("./routes/users");

var mongoDB =
  "mongodb+srv://Hugo:GrIT0luqnFt9eWKK@cluster0.gkqj7cg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoDB);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "Erro de conexão á base de dados"));
db.once("open", function () {
  console.log("Conectado á base de dados!");
});

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use("/uploads", express.static("public/uploads"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null; 
  next();
});

app.use("/", homeRoutes);
app.use("/dashboard", indexRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRoutes);
app.use("/menus", menuRoutes);
app.use("/dishes", dishRoutes);
app.use("/users", usersRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
