const { requireAuth, requireMunicipal } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

const { 
  createIssue, 
  getIssues, 
  updateIssueStatus, 
  deleteIssue, 
  getAllIssues, 
  searchIssues,
  getUsersIssues,
  voteIssue,
  assignIssue,
  escalateIssue,
  decideIssueAuthenticity
} = require('../controllers/IssueControl');

router.get('/issues', getIssues);
router.get('/issues/all', requireAuth(), requireMunicipal(), getAllIssues);
router.get('/issues/search', searchIssues);
router.get('/user/:userId/issues', requireAuth(), getUsersIssues);

router.post('/issues', requireAuth(), createIssue);
router.patch('/issues/:id/status', requireAuth(), requireMunicipal(), updateIssueStatus);
router.patch('/issues/:id/assign', requireAuth(), requireMunicipal(), assignIssue);
router.patch('/issues/:id/escalate', requireAuth(), requireMunicipal(), escalateIssue);
router.patch('/issues/:id/decision', requireAuth(), requireMunicipal(), decideIssueAuthenticity);
router.delete('/issues/:id', requireAuth(), requireMunicipal(), deleteIssue);
router.post('/issues/:id/vote', requireAuth(), voteIssue);

module.exports = router;
