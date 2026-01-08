const express=require("express");
const router=express.Router();

router.get("/",(req,res)=>{
  res.send("get for post");
});
router.get("//:id",(req,res)=>{
  res.send("get id for post");
});
router.post("/",(req,res)=>{
  res.send("post for post");
});
router.post("/:id",(req,res)=>{
  res.send("post id for post");
});
module.exports=router;