const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());


let users = [];


let userId = 1;

app.get("/", (req, res) => {
res.send("hello wolrd")
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const newUser = { id: userId++, name, email, password };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully", user: newUser });
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.status(200).json({ message: "Login successful", user });
});


app.get("/users", (req, res) => {
  res.status(200).json(users);
});


app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  const user = users.find((u) => u.id === parseInt(id));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;

  res.status(200).json({ message: "User updated successfully", user });
});


app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const index = users.findIndex((u) => u.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(index, 1);
  res.status(200).json({ message: "User deleted successfully" });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CMS Server running on port ${PORT}`);
});
