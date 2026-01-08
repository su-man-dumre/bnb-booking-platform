const express = require('express');
const app = express();
const cookieParser=require("cookie-parser");
const users = require("./routes/user.js");
const posts = require("./routes/post.js");


app.use(cookieParser("secretcode"));

app.get("/getsignedcookies",(req,res)=>{
  res.cookie("color","red",{signed:true});
  res.send("done!");
});

app.get("/verify",(req,res)=>{
  // res.send(req.signedCookies);
  console.log(req.signedCookies);
  res.send("verified!");
});


app.get("/getcookies", (req, res) => {
  res.cookie("greet", "hello");   
  res.send("sent you some cookies!");
});

app.get("/greet",(req,res)=>{
  let {name="anonymous"}=req.cookies;
  res.send(`hello ${name}`);
})

app.get("/", (req, res) => {
  console.dir(req.cookies);
  res.send("hi, i am root!");
});

app.use("/users", users);
app.use("/posts", posts);

app.listen(3000, () => {
  console.log("server is listening to 3000");
});
