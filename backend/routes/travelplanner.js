var express = require('express');
var router = express.Router();

var attraction_controller = require('../controllers/tpAttractionController');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send("Welcome to Trip Route Planner!\nSuccesfully connect to the backend!");
});

router.get('/0-preprocess/', attraction_controller.preprocess)
router.post('/1-get-attraction-groups/', attraction_controller.step1)
router.post('/2-get-route-restaurant/', attraction_controller.step2)
router.post('/get-travel-times/', attraction_controller.travel_times)

router.get('/attractions/', attraction_controller.attractions)
router.get('/attractionmaps/', attraction_controller.attractionmaps)
router.get('/parkings/', attraction_controller.parkings)
router.get('/restaurants/', attraction_controller.restaurants)
router.get('/restaurantmaps/', attraction_controller.restaurantmaps)
router.get('/currentlocations/', attraction_controller.curlocations)

module.exports = router;