const express = require('express');
const router = express.Router();
const path = require('path');
const statesController = require('../controllers/statesController');
const cors = require('cors');
const corsOptions = require('../config/corsOptions');

router.options('*', cors());


router.route('/')
    .get(statesController.getAllStates)
    .post()
    .put()
    .delete()

    router.route('/:state')
    .get(statesController.getOneState);

    router.route('/:state/funfact')
    .get(statesController.getFunfact)
    .post(statesController.addFunfact)
    .patch(statesController.editFunfact)
    .delete(statesController.deleteFunfact);

    router.route('/:state/capital')
    .get(statesController.getStateCapital);

    router.route('/:state/nickname')
    .get(statesController.getStateNickname);

    router.route('/:state/population')
    .get(statesController.getStatePopulation);

    router.route('/:state/admission')
    .get(statesController.getStateAdmission);


module.exports = router;