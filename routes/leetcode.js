
const {getTodayPOTD}= require('../services/leetcodeService');
const express = require('express');


const router= express.Router();


 router.get("/potd",async (req, res) => {
    const potd=await getTodayPOTD();
    if(potd){
        res.status(200).json(potd);
    }else{
        res.status(404).json({error:"No POTD found"});
    }
})

router.get("/recent-submissions",async (req, res) => {
    const submissions=await getRecentAcceptedSubmissions();
    res.status(200).json(submissions);
})

router.get("/is-potd-solved",async (req, res) => {
    const isSolved=await isProblemOfDaySolved();
    res.status(200).json(isSolved);
})



module.exports= router;