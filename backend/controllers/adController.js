const Ad = require('../models/Ad');

exports.createAd = async (req, res) => {
    try {
        console.log('--- CREATE AD REQUEST ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        const { title, imageUrl, redirectUrl, placement } = req.body;
        
        if (!title || !imageUrl) {
            console.error('MISSING REQUIRED FIELDS: title or imageUrl');
            return res.status(400).json({ error: 'Title and Image are required' });
        }

        const ad = new Ad({ title, imageUrl, redirectUrl, placement });
        await ad.save();
        
        console.log('AD CREATED SUCCESS:', ad._id);
        res.status(201).json(ad);
    } catch (error) {
        console.error('AD CREATION EXCEPTION:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAds = async (req, res) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActiveAds = async (req, res) => {
    try {
        const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAd = async (req, res) => {
    try {
        console.log('--- DELETE AD REQUEST ---');
        console.log('ID:', req.params.id);
        const ad = await Ad.findByIdAndDelete(req.params.id);
        if (!ad) {
            console.error('AD NOT FOUND FOR DELETION:', req.params.id);
            return res.status(404).json({ message: 'Ad not found' });
        }
        console.log('AD DELETED SUCCESS:', req.params.id);
        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        console.error('AD DELETION ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.toggleAdStatus = async (req, res) => {
    try {
        console.log('--- TOGGLE AD STATUS REQUEST ---');
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            console.error('AD NOT FOUND FOR TOGGLE:', req.params.id);
            return res.status(404).json({ message: 'Ad not found' });
        }
        ad.isActive = !ad.isActive;
        await ad.save();
        console.log('AD STATUS TOGGLED:', ad._id, 'New Status:', ad.isActive);
        res.json(ad);
    } catch (error) {
        console.error('AD TOGGLE ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
};
