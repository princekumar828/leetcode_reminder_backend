const express = require('express');

const router= express.Router();

const {handlegetuserbyemail,handeluserdelete,handelusersetup}= require('../controllers/users');



router.get('/:email', handlegetuserbyemail);

router.post('/delete',handeluserdelete);


router.post('/setup',handelusersetup);


module.exports = router;