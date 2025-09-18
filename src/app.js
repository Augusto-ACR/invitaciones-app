require("dotenv").config();
const express = require("express");
const AppDataSource = require("./data-source");
const invitationRoutes = require("./routes/invitationRoutes.js");
const app = express();
const path = require("path");
app.use(express.json());



// Middlewares
app.use(express.json());
app.use("/api/invitations", invitationRoutes);
app.use(express.static("public")); // para servir create.html e invite.html


// Cualquier /i/:slug sirve invite.html
app.get("/i/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "invite.html"));
});


app.get("/summary/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "summary.html"));
});

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Conectado a la base de datos con TypeORM");

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar con la base de datos", err);
  });
