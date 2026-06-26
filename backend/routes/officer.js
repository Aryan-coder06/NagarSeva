const { requireAuth, requireMunicipal } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const { createOfficer, getOfficers, updateOfficer, deleteOfficer } = require('../controllers/officerControl');

router.post('/officers', requireAuth(), requireMunicipal(), createOfficer);
router.get('/officers', requireAuth(), requireMunicipal(), getOfficers);
router.put('/officers/:id', requireAuth(), requireMunicipal(), updateOfficer);
router.delete('/officers/:id', requireAuth(), requireMunicipal(), deleteOfficer);

module.exports = router;
