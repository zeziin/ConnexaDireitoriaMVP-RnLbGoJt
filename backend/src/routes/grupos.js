const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');

router.post('/', gruposController.create);
router.get('/', gruposController.list);
router.post('/entrar', gruposController.join);

module.exports = router;
