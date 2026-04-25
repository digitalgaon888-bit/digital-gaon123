const express = require('express');
const router = express.Router();
const { logStudy, getEntries, deleteEntry } = require('../controllers/studyController');

router.post('/log', logStudy);
router.get('/entries', getEntries);
router.delete('/entry/:id', deleteEntry);

module.exports = router;
