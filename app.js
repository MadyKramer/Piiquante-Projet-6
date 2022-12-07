const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const app = express();
const path = require("path");
const cors = require("cors");

const sauce = require("./models/sauce");
const stuffRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

//Connexion BDD
mongoose
  .connect(
    "mongodb+srv://Rosenrot:TillLindemann@cluster0.fts4x.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));



app.use((req, res, next) => {
  //on indique que les ressources peuvent être partagées depuis n'importe quelle origine
  res.setHeader("Access-Control-Allow-Origin", "*");
  //on indique les entêtes qui seront utilisées après la pré-vérification cross-origin afin de donner l'autorisation
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  //on indique les méthodes autorisées pour les requêtes HTTP
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", stuffRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
