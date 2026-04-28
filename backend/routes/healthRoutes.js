const express = require('express');
const router = express.Router();
const HealthPatient = require('../models/HealthPatient');
const HealthVisit = require('../models/HealthVisit');
const HealthMedicine = require('../models/HealthMedicine');
const HealthQueue = require('../models/HealthQueue');

// --- PATIENTS ---
router.get('/patients', async (req, res) => {
    try {
        const { email } = req.query;
        const patients = await HealthPatient.find({ email }).sort({ name: 1 });
        res.json(patients);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/patients', async (req, res) => {
    try {
        const { email, name, phone, age, gender } = req.body;
        const patient = new HealthPatient({ email, name, phone, age, gender });
        await patient.save();
        res.status(201).json(patient);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// CRITICAL FIX: Ensure delete route is correctly defined and exported
router.delete('/patients/:id', async (req, res) => {
    try {
        const patientId = req.params.id;
        console.log(`[Admin Action] Deleting Patient: ${patientId}`);
        
        const deletedPatient = await HealthPatient.findByIdAndDelete(patientId);
        if (!deletedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        // Also clean up their visits and queue entries
        await HealthVisit.deleteMany({ patientId });
        await HealthQueue.deleteMany({ patientId });
        
        res.json({ message: 'Patient and all associated records deleted successfully' });
    } catch (err) { 
        console.error('Delete Patient Error:', err);
        res.status(500).json({ error: 'Server error' }); 
    }
});

// --- VISITS & PRESCRIPTIONS ---
router.post('/visits', async (req, res) => {
    try {
        const { email, patientId, patientName, patientPhone, symptoms, diagnosis, prescription, totalAmount, paymentStatus } = req.body;
        
        const visit = new HealthVisit({ 
            email, patientId, patientName, patientPhone, symptoms, diagnosis, prescription, totalAmount, paymentStatus 
        });
        await visit.save();

        // Update patient last visit
        await HealthPatient.findByIdAndUpdate(patientId, { lastVisit: Date.now() });

        res.status(201).json(visit);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: 'Server error' }); 
    }
});

router.get('/visits', async (req, res) => {
    try {
        const { email, patientId } = req.query;
        const query = { email };
        if (patientId) query.patientId = patientId;
        const visits = await HealthVisit.find(query).sort({ date: -1 }).limit(100);
        res.json(visits);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/visits/:id', async (req, res) => {
    try {
        await HealthVisit.findByIdAndDelete(req.params.id);
        res.json({ message: 'Record deleted' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// --- MEDICINES ---
router.get('/medicines', async (req, res) => {
    try {
        const { email } = req.query;
        const medicines = await HealthMedicine.find({ email }).sort({ name: 1 });
        res.json(medicines);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/medicines', async (req, res) => {
    try {
        const { email, name, stock, unit, price, expiryDate } = req.body;
        const med = new HealthMedicine({ email, name, stock, unit, price, expiryDate });
        await med.save();
        res.status(201).json(med);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
