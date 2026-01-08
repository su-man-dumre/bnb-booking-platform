const express=require("express");
const router=express.Router();

router.get("/",(req,res)=>{
  res.send("Get for users");
});
router.get("/:id",(req,res)=>{
  res.send("Get for users id ");
});

router.post("/",(req,res)=>{
  res.send("post for users ");
});

router.post("/:id",(req,res)=>{
  res.send("post for users id ");
});
module.exports=router;