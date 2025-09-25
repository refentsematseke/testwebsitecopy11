const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const DB_FILE = "./db.json";
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({drivers:[]},null,2));

function loadDB(){ return JSON.parse(fs.readFileSync(DB_FILE)); }
function saveDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }

/* Search driver */
app.get("/api/drivers", (req,res)=>{
  const q=(req.query.q||"").toLowerCase();
  const db=loadDB();
  const d=db.drivers.find(dr=>dr.name.toLowerCase().includes(q)||dr.license.toLowerCase().includes(q)||dr.phone.includes(q));
  if(!d) return res.status(404).send({error:"Not found"});
  res.json(d);
});

/* Get driver by ID */
app.get("/api/drivers/:id",(req,res)=>{
  const db=loadDB(); const d=db.drivers.find(dr=>dr.id==req.params.id);
  if(!d) return res.status(404).send({error:"Not found"});
  res.json(d);
});

/* Add review */
app.post("/api/drivers/:id/reviews",(req,res)=>{
  const {user,rating,text}=req.body;
  const db=loadDB(); const d=db.drivers.find(dr=>dr.id==req.params.id);
  if(!d) return res.status(404).send({error:"Not found"});
  d.reviews.push({user,rating,text});
  saveDB(db); res.json(d);
});

/* Add report */
app.post("/api/reports",(req,res)=>{
  const {name,phone,license,model,colour,desc}=req.body;
  const db=loadDB();
  let d=db.drivers.find(dr=>dr.license.toLowerCase()===license.toLowerCase());
  if(!d){
    d={id:Date.now(),name,phone,license,model,colour,reports:0,incidents:[],reviews:[]};
    db.drivers.push(d);
  }
  d.reports++;
  d.incidents.push({date:new Date().toISOString().slice(0,10),desc});
  saveDB(db); res.json(d);
});

app.listen(3000,()=>console.log("FED server running at http://localhost:3000"));
