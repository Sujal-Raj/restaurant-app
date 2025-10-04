const express = require("express");
const menuModel = require("../models/menu.model");

const router = express.Router();

router.get("/menu",async (req,res)=>{
    try {
        const response = await menuModel.find();

        return res.status(200).json({
            message:"Menu fetched",
            response
        })
    } catch (error) {
        return res.status(500).json({
            message:"Something went wrong"
        })
    }
})

module.exports = router;