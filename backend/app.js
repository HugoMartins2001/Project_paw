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
const adminRoutes = require('./routes/admin');
const ordersRouter = require("./routes/orders");
const checkoutRoutes = require('./routes/checkout');
const cors = require('cors');
const contactRouter = require('./routes/contact');

var mongoDB = "mongodb+srv://Hugo:GrIT0luqnFt9eWKK@cluster0.gkqj7cg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoDB);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "Erro de conexão á base de dados"));
db.once("open", function () {
  console.log("Conectado á base de dados!");
  console.log("Servidor a correr em http://localhost:3000");
});

var app = express();
app.use(cors({
  origin: 'http://localhost:4200', // Porta padrão do Angular
  credentials: true
}));

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
app.use("/api/dashboard", indexRouter);
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", ordersRouter);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/contact', contactRouter);


app.use(function (req, res, next) {
  next(createError(404));
});

// Exemplo de tratamento de erro para API
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({ error: err.message });
});

const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

// Guarda o io para usar nos controladores
app.set('io', io);

// Altera a porta para 3001
http.listen(3001, () => console.log('Server running on http://localhost:3001'));


module.exports = app;
