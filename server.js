const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// 🔥 SERVIR FRONTEND (pasta public)
app.use(express.static("public"));

// 🔗 MONGO DB
mongoose.connect("mongodb+srv://Pedro:Orca1234@cluster0.lk9kiqy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("Mongo conectado"))
.catch(err => console.log("Erro Mongo:", err));

// 👤 USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String
});

const SECRET = "block-jogos-secret";

// 🔐 REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ error: "Usuário já existe" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hash
  });

  res.json({ ok: true });
});

// 🔐 LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Erro login" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Erro login" });

  const token = jwt.sign(
    { id: user._id },
    SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
});

// 🛡️ AUTH MIDDLEWARE
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.sendStatus(401);

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

// 🔒 DASHBOARD PROTEGIDO
app.get("/dashboard", auth, (req, res) => {
  res.send("Dashboard funcionando 🚀");
});

// 🏠 HOME
app.get("/", (req, res) => {
  res.send("Block Jogos Online 🚀");
});

// 🚀 PORTA (OBRIGATÓRIO PARA RENDER)
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando");
});