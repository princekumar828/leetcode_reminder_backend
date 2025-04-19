const POTD = require('../models/potd');

const savePOTD = async (req, res) => {
    try {
        const { date, title } = req.body;

        // Validate required fields
        if (!date || !title) {
            return res.status(400).json({
                success: false,
                message: 'Date and title are required'
            });
        }

        // Create new POTD
        const potd = new POTD({
            date: new Date(date),
            title
        });

        // Save to database
        await potd.save();

        res.status(201).json({
            success: true,
            message: 'POTD saved successfully',
            data: potd
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A POTD for this date already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error saving POTD',
            error: error.message
        });
    }
};

module.exports = {
    savePOTD
}; 