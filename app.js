const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");   
const fs = require("fs");       




const app = express();
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
// app.use("/uploads", express.static("uploads"));

const SECRET_KEY = "my_super_secret_key";


let users = [];

let userId = 1;



// -------------------- AUTH MIDDLEWARE -------------------->

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.users = decoded; 
    next(); 
  });
};



// ---------------- FILE UPLOAD SETUP ---------------->

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });




// PROFILE PHOTO UPLOAD (Protected)

app.post("/users/:id/profile-upload", authenticate, upload.single("image"), (req, res) => {
  const { id } = req.params;

  const user = users.find((u) => u.id === parseInt(id));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  // Save uploaded file name
  user.phone = req.file.filename;

  res.status(200).json({
    message: "Profile uploaded successfully",
    user
  });
});



app.post("/users/:id/documents", authenticate, upload.array("documents", 10), (req, res) => {
  const { id } = req.params;

  const user = users.find((u) => u.id === parseInt(id));
  if (!user) return res.status(404).json({ message: "User not found" });

  user.documents = req.files.map((file) => file.filename);

  res.status(200).json({
    message: "Documents uploaded successfully",
    documents: user.documents
  });
});

// -------------------- ROUTES -------------------->
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


// LOGIN + TOKEN ISSUED
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Create JWT Token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    user,
  });
});



// GET ALL USERS (Protected) 
app.get("/users", authenticate, (req, res) =>
         { res.status(200).json(users); 

   });


// UPDATE USER (Protected) 
app.put("/users/:id", authenticate, (req, res) => {
      const { id } = req.params;

    const { name, email, password } = req.body;

    const user = users.find((u) => u.id === parseInt(id)); 

    if (!user) { return res.status(404).json({ message: "User not found" }); }

     if (name) user.name = name;
      if (email) user.email = email; 
     if (password) user.password = password;

      res.status(200).json({ message: "User updated successfully", user });
     });



app.delete("/users/:id",authenticate, (req, res) => {
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
