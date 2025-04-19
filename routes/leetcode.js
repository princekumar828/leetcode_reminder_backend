
const {getProblemOfDay}= require('../services/leetcodeService');
const express = require('express');


const router= express.Router();

 router.get("/potd",async (req, res) => {
    try {
        const problemOfDay = await getProblemOfDay();
        res.status(200).json(problemOfDay);
    } catch (error) {
        console.error('Error fetching problem of the day:', error.message);
        res.status(500).json({ error: 'Failed to fetch problem of the day' });
    }
})

module.exports= router;