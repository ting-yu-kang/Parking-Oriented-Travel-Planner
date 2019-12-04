var Attraction = require('../models/attraction');
var Attractionmaps = require('../models/attractionmap')
var Parkings = require('../models/parking')
var Restaurants = require('../models/restaurant')
var Restaurantmaps = require('../models/restaurantmap')
// var Category = require('../models/category');
// var Famous_attraction = require('../models/famous_attraction');
var Current_location = require('../models/current_location');
var Request = require("request");
var async = require('async');

const km_per_latitude = 111;
const km_per_longitude = 88;
const GOOGLE_API_KEY = "XXX";
// const YELP_API_KEY = "XXX";
// const SELF_URL = process.env.SELF_URL || "http://127.0.0.1:4000/travel-assistant/";
const MAX_TRIP_RADIUS = 10000;
const MAX_WALKING_DISTANCE = 500;
const MIN_PARKING_DISTANCE = 3000;
const ATTRACTION_GROUP_SIZE = 6;
const WALK_TIME = 10;
const LUNCH_TIME = [11 * 60, 13 * 60];
const DINNER_TIME = [18 * 60, 20 * 60];
const MEAL_TIME = 60;
const B = 250;
const DEFAULT_CURRENT_LOCATION_INDEX = 2;

module.exports = {
    preprocess: function (req, res, next) {
        async.parallel([
            function (finish) {
                Attractionmaps.find({}, 'name id', function (err, maps) {
                    if (err) {
                        console.log(err);
                        finish(err, null);
                    } else {
                        finish(null, maps);
                    }
                });
            },
            function (finish) {
                Restaurantmaps.find({}, 'name id', function (err, maps) {
                    if (err) {
                        console.log(err);
                        finish(err, null);
                    } else {
                        finish(null, maps)
                    }
                });
            }
        ], function (error, result) {
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                attraction_maps = result[0];
                var attraction_categories = [];
                for (attraction_category of attraction_maps) {
                    attraction_category = attraction_category.toObject();
                    attraction_categories.push({
                        "key": attraction_category.id,
                        "name": attraction_category.name
                    });
                }
                restaurant_maps = result[1];
                restaurant_categories = [];
                for(restaurant_map of restaurant_maps){
                    restaurant_map = restaurant_map.toObject();
                    restaurant_categories.push({
                        "key": restaurant_map.id,
                        "name": restaurant_map.name
                    })
                }
                total_result = {
                    "attraction_categories": attraction_categories,
                    "restaurant_categories": restaurant_categories
                };
                res.json(total_result);
            }
        });
    },
    step1: function (req, res, next) {
        var req_categories = req.body.attraction_categories;
        var current_location_index = req.body.current_location_index == undefined ? DEFAULT_CURRENT_LOCATION_INDEX : req.body.current_location_index;
        regex = req_categories.map(function (k) { return new RegExp('.*' + k + '.*'); });

        console.log(req_categories);

        async.parallel([
            // current location
            function (finish) {
                Current_location.find({}, 'Lat Long', function (err, location) {
                    if (err) {
                        console.error(err);
                        finish(err);
                    } else {
                        finish(null, location);
                    }
                });
            },

            // find attraction
            function (finish) {
                Attraction.find({
                    'sub_Cat': {
                        $in: regex
                    }
                }, 'Name Lat Long Address Price Rating sub_Cat', function (err, attractions) {
                    if (err) {
                        console.error(err);
                        finish(err);
                    } else {
                        finish(null, attractions);
                    }
                });
            },

            // find parking lot
            function (finish) {
                Parkings.findRandom({}, 'Name Lat Long Address', {
                    limit: 500
                }, function (err, parkings) {
                    if (err) {
                        console.error(err);
                        finish(err);
                    } else {
                        finish(null, parkings);
                    }
                });
            },
        ], function (errs, results) {
            if (errs) {
                console.error(errs);
                res.send(errs);
            } else {
                var attraction_groups = [];
                var parking_attraction_number = {};
                var current_location = [results[0][current_location_index].toObject().Lat, results[0][current_location_index].toObject().Long];
                var attractions = results[1];
                var parking_lots = results[2];
                var attraction_group_num = 0;
                var attraction_num = 0;

                // get parking lots around start loc
                for (i in parking_lots) {
                    parking_lot = parking_lots[i].toObject();
                    var parking_lot_loc = [parking_lot.Lat, parking_lot.Long];
                    if (cal_distance(parking_lot_loc, current_location) > MAX_TRIP_RADIUS)
                        continue;
                    var count = 0;
                    // calculate attraction around parking lot
                    for (attraction of attractions) {
                        var attraction_loc = [attraction.toObject().Lat, attraction.toObject().Long];
                        if (cal_distance(parking_lot_loc, attraction_loc) <= MAX_WALKING_DISTANCE) {
                            count++;
                        }
                    }
                    parking_attraction_number[i] = count;
                }

                // sort according to attractions around parking lot
                var sorted_parking_lots = Object.keys(parking_attraction_number).map(function (key) {
                    return [key, parking_attraction_number[key]];
                });
                sorted_parking_lots.sort(function (a, b) {
                    return b[1] - a[1];
                });

                // build attraction groups until size reaches ATTRACTION_GROUP_SIZE
                for (p of sorted_parking_lots) {
                    // break when attraction group is enough or when no attraction found
                    if (attraction_groups.length >= ATTRACTION_GROUP_SIZE || p[1] == 0)
                        break;

                    var parking_lot_idx = parseInt(p[0]);
                    var parking_lot = parking_lots[parking_lot_idx].toObject();
                    var parking_lot_loc = [parking_lot.Lat, parking_lot.Long];
                    var use = true;
                    // if the center is too near from the current groups, don't use it
                    for (attraction_group of attraction_groups) {
                        var attraction_enter_loc = [attraction_group.parking_lot.location.latitude, attraction_group.parking_lot.location.longitude];
                        if (cal_distance(attraction_enter_loc, parking_lot_loc) < MIN_PARKING_DISTANCE) {
                            console.log("don't use");
                            use = false;
                            break;
                        }
                    }
                    if (!use) {
                        continue;
                    } else {
                        // use it, build attraction group
                        var attraction_group = {
                            "parking_lot": {
                                "name": parking_lot.Name,
                                "location": {
                                    "latitude": parking_lot.Lat,
                                    "longitude": parking_lot.Long
                                }
                            },
                            "attractions": []
                        };
                        for (attr of attractions) {
                            attraction = attr.toObject();
                            var attraction_loc = [attraction.Lat, attraction.Long];
                            if (cal_distance(parking_lot_loc, attraction_loc) <= MAX_WALKING_DISTANCE) {
                                var pushed_attraction = {
                                    "name": attraction.Name,
                                    "category": attraction.sub_Cat,
                                    "location": {
                                        "latitude": attraction.Lat,
                                        "longitude": attraction.Long
                                    },
                                    "estimate_time": 30,
                                    "rating": attraction.Rating,
                                };
                                attraction_group.attractions.push(pushed_attraction);
                                attraction_num += 1;
                            }
                        }
                        attraction_groups.push(attraction_group);
                        attraction_group_num += 1;
                    }
                }
                // build return object
                var ret_obj = {
                    "current_location": {
                        "latitude": current_location[0],
                        "longitude": current_location[1]
                    },
                    "attraction_group_num": attraction_group_num,
                    "attraction_num": attraction_num,
                    "attraction_groups": attraction_groups
                }

                res.send(ret_obj);
            }
        });
    },
    step2: function (req, res, next) {
        departure_hr = req.body.departure_time[0];
        departure_min = req.body.departure_time[1];
        attraction_groups = req.body.attraction_groups;
        var current_location_index = req.body.current_location_index == undefined ? DEFAULT_CURRENT_LOCATION_INDEX : req.body.current_location_index;
        var new_attraction_groups = [];
        var loc_time_idx = [];

        async.waterfall([
            // find the order of groups
            function (next) {
                Current_location.find({}, 'Lat Long', function (err, location) {
                    if (err) {
                        console.log(err);
                        next(err);
                    } else {
                        for (var i in attraction_groups) {
                            attraction_group = attraction_groups[i]
                            var time = 0;
                            var new_attractions = [];
                            for (var attraction of attraction_group.attractions) {
                                if (attraction.estimate_time > 0) {
                                    new_attractions.push(attraction);
                                    time += attraction.estimate_time;
                                }
                            }
                            attraction_group.attractions = new_attractions;
                            if (time > 0) {
                                new_attraction_groups.push(attraction_group);
                                loc_time_idx.push({
                                    "location": [attraction_group.parking_lot.location.latitude, attraction_group.parking_lot.location.longitude],
                                    "time": time + WALK_TIME * new_attractions.length,
                                    "index": i
                                });
                            }
                        }
                        min_order = calculate_order(loc_time_idx, [location[current_location_index].toObject().Lat, location[current_location_index].toObject().Long]);
                        sorted_new_attraction_groups = [];
                        for (var i of min_order) {
                            sorted_new_attraction_groups.push(new_attraction_groups[i]);
                        }

                        next(null, {
                            "current_location": {
                                "latitude": location[current_location_index].toObject().Lat,
                                "longitude": location[current_location_index].toObject().Long
                            },
                            "attraction_groups": sorted_new_attraction_groups
                        });
                    }
                });
            },
            // find travel time between groups
            function (sorted_attraction_groups_with_curr_loc, next) {
                var current_location = sorted_attraction_groups_with_curr_loc.current_location.latitude + "," + sorted_attraction_groups_with_curr_loc.current_location.longitude;
                var attraction_groups = sorted_attraction_groups_with_curr_loc.attraction_groups;
                locations = [];
                locations.push(current_location);
                for (attraction_group of attraction_groups) {
                    locations.push(attraction_group.parking_lot.location.latitude + "," + attraction_group.parking_lot.location.longitude);
                }
                var origins = "";
                var destinations = "";
                for (var i in locations) {
                    if (i < locations.length - 1)
                        origins += locations[i] + "|";
                    if (i > 0)
                        destinations += locations[i] + "|";
                }
                console.log(origins);
                console.log(destinations);

                var propertiesObject = {
                    mode: "driving",
                    language: "en",
                    avoid: "highways",
                    units: "metric",
                    origins: origins,
                    destinations: destinations,
                    key: GOOGLE_API_KEY,
                };
                Request({
                    url: "https://maps.googleapis.com/maps/api/distancematrix/json",
                    qs: propertiesObject
                }, function (error, response, body) {
                    if (error) {
                        console.log(error);
                        next(error);
                    } else {
                        time_result = JSON.parse(body).rows;
                        times = [];
                        distances = []
                        for (var i in time_result) {
                            times.push(time_result[i].elements[i].duration.value);
                            distances.push(time_result[i].elements[i].distance.value);
                        }
                        console.log(times, distances);
                        next(null, sorted_attraction_groups_with_curr_loc, {
                            "times": times,
                            "distances": distances
                        });
                    }
                });
            },
            // fill the travel estimate time
            function (sorted_attraction_groups_with_curr_loc, times_distances, next) {
                var curr_time = departure_hr * 60 + departure_min;
                var need_lunch = curr_time <= LUNCH_TIME[1];
                var need_dinner = curr_time <= DINNER_TIME[1];
                var meal_index = {};

                for (var i in sorted_attraction_groups_with_curr_loc.attraction_groups) {
                    var attraction_group = sorted_attraction_groups_with_curr_loc.attraction_groups[i];
                    var total_time = 0;

                    for (var attraction of attraction_group.attractions) {
                        total_time += attraction.estimate_time + 10;
                    }

                    if (need_lunch && curr_time >= LUNCH_TIME[0]) {
                        curr_time += MEAL_TIME;
                        meal_index.lunch = i - 1;
                        need_lunch = false;
                    }

                    if (need_dinner && curr_time >= DINNER_TIME[0]) {
                        curr_time += MEAL_TIME;
                        meal_index.dinner = i - 1;
                        need_dinner = false;
                    }

                    start_time = curr_time + Math.floor(times_distances.times[i] / 60);
                    end_time = start_time + total_time;

                    attraction_group.travel_times = {
                        estimate_start_time: Math.floor(start_time / 60) + ":" + start_time % 60,
                        estimate_end_time: Math.floor(end_time / 60) + ":" + end_time % 60
                    }

                    curr_time = end_time;
                }
                if (need_dinner && curr_time >= DINNER_TIME[0]) {
                    meal_index.dinner = sorted_attraction_groups_with_curr_loc.attraction_groups.length - 1;
                }
                console.log(meal_index);
                next(null, sorted_attraction_groups_with_curr_loc, meal_index);
            },
            // find restaurant
            function (sorted_attraction_groups_with_curr_loc, meal_index, next) {
                Restaurants.find({}, 'Name Address Lat Long Rating Price Cat', function (err, restaurants) {
                    if (err) {
                        console.log(err);
                        next(err);
                    } else {
                        sorted_attraction_groups_with_curr_loc.restaurants = {};
                        if ('lunch' in meal_index) {
                            [start_location, end_location] = get_start_end_locations(meal_index.lunch, sorted_attraction_groups_with_curr_loc);
                            var found_restaurants = get_nearby_restaurants(start_location, end_location, restaurants);
                            sorted_attraction_groups_with_curr_loc.restaurants.lunch = {
                                "after_group_id": meal_index.lunch,
                                "restaurants": found_restaurants
                            };
                        }
                        if ('dinner' in meal_index) {
                            [start_location, end_location] = get_start_end_locations(meal_index.dinner, sorted_attraction_groups_with_curr_loc);
                            var found_restaurants = get_nearby_restaurants(start_location, end_location, restaurants);
                            sorted_attraction_groups_with_curr_loc.restaurants.dinner = {
                                "after_group_id": meal_index.dinner,
                                "restaurants": found_restaurants
                            };
                        }

                        next(null, sorted_attraction_groups_with_curr_loc);
                    }
                });
            },
            // get restaurant category
            function (sorted_attraction_groups_with_curr_loc_restaurant, next) {
                Restaurantmaps.find({}, 'name id', function (err, restaurant_maps) {
                    if (err) {
                        console.log(err);
                        next(err);
                    } else {
                        console.log(restaurant_maps);
                        restaurant_categories = [];
                        for(restaurant_map of restaurant_maps){
                            restaurant_map = restaurant_map.toObject();
                            restaurant_categories.push({
                                "key": restaurant_map.id,
                                "name": restaurant_map.name
                            })
                        }
                        sorted_attraction_groups_with_curr_loc_restaurant.restaurant_categories = restaurant_categories;
                        next(null, sorted_attraction_groups_with_curr_loc_restaurant)
                    }
                });
            }
        ], function (err, sorted_attraction_groups_with_curr_loc_restaurant) {
            if (err) {
                console.error(err);
                next();
            } else {
                res.json(sorted_attraction_groups_with_curr_loc_restaurant);
            }
        });
    },
    travel_times: function (req, res, next) {
        var current_location = req.body.current_location.latitude + "," + req.body.current_location.longitude;
        var attraction_groups = req.body.attraction_groups;
        locations = [];
        locations.push(current_location);
        for (attraction_group of attraction_groups) {
            locations.push(attraction_group.parking_lot.location.latitude + "," + attraction_group.parking_lot.location.longitude);
        }
        var origins = "";
        var destinations = "";
        for (var i in locations) {
            if (i < locations.length - 1)
                origins += locations[i] + "|";
            if (i > 0)
                destinations += locations[i] + "|";
        }
        console.log(origins);
        console.log(destinations);

        var propertiesObject = {
            mode: "driving",
            language: "en",
            avoid: "highways",
            units: "metric",
            origins: origins,
            destinations: destinations,
            key: GOOGLE_API_KEY,
        };
        Request({
            url: "https://maps.googleapis.com/maps/api/distancematrix/json",
            qs: propertiesObject
        }, function (error, response, body) {
            if (error) {
                next(error);
            } else {
                time_result = JSON.parse(body).rows;
                times = [];
                distances = []
                for (var i in time_result) {
                    times.push(time_result[i].elements[i].duration.value);
                    distances.push(time_result[i].elements[i].distance.value);
                }
                console.log(times, distances);
                res.json({
                    "times": times,
                    "distances": distances
                });
            }
        });
    },
    attractions: function (req, res, next) {
        Attraction.find({}, 'Name Address', function (err, attractions) {
            if (err) {
                console.log(err);
            } else {
                res.json(attractions);
            }
        });
    },
    attractionmaps: function (req, res, next) {
        Attractionmaps.find({}, 'name id parent', function (err, maps) {
            if (err) {
                console.log(err);
            } else {
                res.json(maps);
            }
        });
    },
    parkings: function (req, res, next) {
        Parkings.find({}, 'Name Address', function (err, parkings) {
            if (err) {
                console.log(err);
            } else {
                res.json(parkings);
            }
        });
    },
    restaurants: function (req, res, next) {
        Restaurants.find({}, 'Name Address', function (err, restaurants) {
            if (err) {
                console.log(err);
            } else {
                res.json(restaurants);
            }
        });
    },
    restaurantmaps: function (req, res, next) {
        Restaurantmaps.find({}, 'name id', function (err, maps) {
            if (err) {
                console.log(err);
            } else {
                res.json(maps);
            }
        });
    },
    curlocations: function (req, res, next) {
        Current_location.find({}, 'Lat Long', function (err, location) {
            if (err) {
                console.log(err);
            } else {
                res.json(location);
            }
        });
    }
};

function get_start_end_locations(idx, sorted_attraction_groups_with_curr_loc) {
    var prev_location;
    var start_location;
    var end_location;

    if (idx - 1 == -1) {
        prev_location = sorted_attraction_groups_with_curr_loc.current_location;
    } else if (idx - 1 != -2) {
        prev_location = sorted_attraction_groups_with_curr_loc.attraction_groups[idx - 1].parking_lot.location;
    }
    prev_location = [prev_location.latitude, prev_location.longitude];

    if (idx == -1) {
        start_location = sorted_attraction_groups_with_curr_loc.current_location;
    } else {
        start_location = sorted_attraction_groups_with_curr_loc.attraction_groups[idx].parking_lot.location;
    }
    start_location = [start_location.latitude, start_location.longitude];

    if (idx + 1 == sorted_attraction_groups_with_curr_loc.attraction_groups.length) {
        var vector = [start_location[0] - prev_location[0], start_location[1] - prev_location[1]];
        end_location = [start_location[0] + vector[0], start_location[1] + vector[1]];
    } else {
        end_location = sorted_attraction_groups_with_curr_loc.attraction_groups[idx + 1].parking_lot.location;
        end_location = [end_location.latitude, end_location.longitude];
    }
    return [start_location, end_location];
}

function get_nearby_restaurants(start_location, end_location, restaurants) {
    var C = cal_distance(start_location, end_location) / 2;
    var A = Math.sqrt(Math.pow(B, 2) + Math.pow(C, 2));
    var found_restaurants = [];
    for (restaurant of restaurants) {
        restaurant = restaurant.toObject();
        restaurant_loc = [restaurant.Lat, restaurant.Long];
        if (cal_distance(restaurant_loc, start_location) + cal_distance(restaurant_loc, end_location) <= 2 * A) {
            found_restaurants.push({
                "name": restaurant.Name,
                "latitude": restaurant.Lat,
                "longitude": restaurant.Long,
                "estimate_time": MEAL_TIME,
                "style": restaurant.Cat,
                "rating": restaurant.Rating,
                "price": restaurant.Price
            }, );
        }
    }
    return found_restaurants;
}

function calculate_order(loc_time_idx, current_location) {
    min_order = [];
    min_dist = 100000000;

    for (var i in loc_time_idx) {
        var now_distance = cal_distance(current_location, loc_time_idx[i].location);
        var path = {
            "distance": 100000000,
            "order": []
        };
        var visit = new Set();
        visit.add(i);
        dfs(path, {
            "distance": now_distance,
            "order": [i]
        }, loc_time_idx, i, visit);
        if (path.distance < min_dist) {
            min_dist = path.distance;
            min_order = path.order;
        }
    }

    return min_order;
}

function dfs(path, now_path, loc_time_idx, last_idx, visit) {
    if (visit.size == loc_time_idx.length) {
        if (now_path.distance < path.distance) {
            path.distance = now_path.distance;
            path.order = JSON.parse(JSON.stringify(now_path.order));
        }
        return;
    }
    for (var i in loc_time_idx) {
        if (visit.has(i))
            continue;
        var new_distance = cal_distance(loc_time_idx[last_idx].location, loc_time_idx[i].location);
        visit.add(i);
        new_path = {
            "distance": now_path.distance + new_distance,
            "order": JSON.parse(JSON.stringify(now_path.order))
        }
        new_path.order.push(i);
        dfs(path, new_path, loc_time_idx, i, visit);
        visit.delete(i);
    }
}

function cal_distance(coordinate1, coordinate2) {
    distance_lat = (coordinate1[0] - coordinate2[0]) * km_per_latitude * 1000;
    distance_lng = (coordinate1[1] - coordinate2[1]) * km_per_longitude * 1000;
    return Math.sqrt(Math.pow(distance_lat, 2) + Math.pow(distance_lng, 2));
}