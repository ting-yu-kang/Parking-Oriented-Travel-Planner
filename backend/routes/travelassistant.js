var express = require('express');
var router = express.Router();

var attraction_controller = require('../controllers/attractionController');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('travel-assistant!!!!!');
});

router.get('/test_connection', attraction_controller.test_connection)

router.get('/attractions', attraction_controller.attraction_list);

router.get('/preprocess', attraction_controller.preprocess)

router.post('/find_auto_attraction_group', attraction_controller.find_auto_attraction_group);
router.post('/find_specified_attraction_group', attraction_controller.find_specified_attraction_group);

router.post('/test', attraction_controller.find_multiple_auto_attraction_groups);
router.post('/test2', attraction_controller.find_multiple_specified_attraction_groups);

module.exports = router;