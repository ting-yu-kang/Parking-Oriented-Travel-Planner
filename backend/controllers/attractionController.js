var Attraction = require('../models/attraction');
var Category = require('../models/category');
var Famous_attraction = require('../models/famous_attraction');
var Current_location = require('../models/current_location');
var Request = require("request");
var async = require('async');

const km_per_latitude = 111;
const km_per_longitude = 88;
const GOOGLE_API_KEY = "XXX";
const YELP_API_KEY = "XXX";
const SELF_URL = process.env.SELF_URL || "http://127.0.0.1:4000/travel-assistant/";
const MAX_RADIUS = 20000;
const WALKING_DISTANCE_MAX = 500;

module.exports = {
    attraction_list: function (req, res, next) {
        Attraction.find({}, 'name coordinates', function (err, attractions) {
            if (err) {
                console.log(err);
            } else {
                res.json(attractions);
            }
        });
    },

    test_connection: function (req, res, next){
        res.send("Welcome to Trip Assistant!\nSuccesfully connect to the backend!");
    },

    preprocess: function (req, res, next) {
        async.parallel([
            function (finish) {
                Category.find({}, function (err, categories) {
                    if (err) {
                        console.error(err);
                        finish(err);
                    } else {
                        finish(null, categories);
                    }
                });
            },
            function (finish) {
                Famous_attraction.find({}, function (err, famous_attractions) {
                    if (err) {
                        console.error(err);
                        finish(err);
                    } else {
                        finish(null, famous_attractions);
                    }
                });
            },
            function (finish) {
                Current_location.find({}, function (err, current_location) {
                    if (err) {
                        console.error(err);
                        finish(err);
                    } else {
                        finish(null, current_location);
                    }
                });
            }
        ], function (errs, results) {
            if (errs) {
                console.error(errs);
                res.send(errs);
            } else {
                part1_category_list = [];
                for (var i = 0; i < results[0].length; i++) {
                    part1_category_list.push([results[0][i].toObject().alias, results[0][i].toObject().name]);
                }
                part2_attraction_list = [];
                for (var i = 0; i < results[1].length; i++) {
                    part2_attraction_list.push([results[1][i].toObject().place_id, results[1][i].toObject().name, results[1][i].toObject().alias]);
                }
                return_data = {
                    "cur_location": {
                        "lat": results[2][0].toObject().latitude,
                        "lng": results[2][0].toObject().longitude
                    },
                    "part1_category_list": part1_category_list,
                    "part2_attraction_list": part2_attraction_list
                }
                res.send(return_data);
            }
        });
    },

    find_multiple_auto_attraction_groups: function (req, res, next) {
        console.log("receive query:");
        console.log(req.body);
        var start_lat = req.body.lat;
        var start_lng = req.body.lng;
        var num_of_groups = req.body.numberofgroups || 5;
        var price = req.body.price;
        var query_categories = [req.body.attraction1, req.body.attraction2, req.body.attraction3];
        var query_categories_string = '';
        var found_attraction = [];
        var found_parking = [];
        var result = [];
        var group_now = 0;

        for (var i = 0; i < query_categories; i++) {
            if (query_categories[i] != '') {
                query_categories_string += req.body.attraction1 + ",";
            }
        }
        if (query_categories_string != '')
            query_categories_string = query_categories_string.slice(0, query_categories_string.length - 1);

        subfunc = function (previous, next) {
            console.log("-------Start Group " + group_now.toString() + "-------");
            var requestData = {
                lat: previous.coordinates.lat,
                lng: previous.coordinates.lng,
                categories: query_categories_string,
                found_attraction: found_attraction,
                found_parking: found_parking
            }
            Request({
                url: SELF_URL + "find_auto_attraction_group",
                method: "post",
                body: requestData,
                json: true
            }, (error, response, body) => {
                if (error) {
                    next(error);
                } else {
                    if (body.attractions == undefined) {
                        next("cannot find attraction group" + group_now.toString() + "!");
                    } else {
                        for (var i = 0; i < body.attractions.length; i++) {
                            found_attraction.push(body.attractions[i].id);
                        }
                        found_parking.push(body.parking[0].place_id);
                        console.log("-------Finish Group " + group_now.toString() + "-------");
                        result.push(body);
                        group_now++;
                        next(null, body.parking[0]);
                    }
                }
            });
        };
        var waterfall_funcs = []
        for (var i = 0; i < num_of_groups; i++) {
            waterfall_funcs.push(subfunc);
        }
        async.waterfall([
                function (next) {
                    var now = {
                        coordinates: {
                            lat: start_lat,
                            lng: start_lng
                        }
                    }
                    group_now++;
                    next(null, now);
                }
            ].concat(waterfall_funcs),
            function (err, para) {
                if (err) {
                    console.error(err);
                }
                if (result.length == 0) {
                    console.error("cannot find any attraction group!");
                    res.json("cannot find any attraction group!");
                } else {
                    for (var i = 0; i < result.length; i++) {
                        result[i]["index"] = i + 1;
                    }
                    res.json(result);
                }
            });
    },

    find_auto_attraction_group: function (req, res, next) {
        var query_lat = req.body.lat;
        var query_lng = req.body.lng;
        var categories = req.body.categories;
        var found_attraction = new Set(req.body.found_attraction);
        var found_parking = new Set(req.body.found_parking);
        console.log("attraction set:" + found_attraction);
        console.log("parking set:" + found_parking);
        async.waterfall([
            //get the nearest attraction
            function (next) {

                yelp_api_call(query_lat, query_lng, MAX_RADIUS, 20, categories, function (error, attraction_results) {
                    if (error) {
                        next(error);
                    } else {
                        nearest_attraction_result = null;
                        //deterministic
                        // for (var i = 0; i < attraction_results.length; i++) {
                        //     if (!found_attraction.has(attraction_results[i].id)) {
                        //         nearest_attraction_result = attraction_results[i];
                        //         break;
                        //     }
                        // }

                        //stochastic
                        for (var counter = 0; counter < 500; counter++) {
                            random_int = Math.floor(Math.random() * attraction_results.length);
                            if (!found_attraction.has(attraction_results[random_int].id)) {
                                nearest_attraction_result = attraction_results[random_int];
                                break;
                            }
                        }
                        if (nearest_attraction_result == null) {
                            next("attractions are all chosen!");
                        } else {
                            console.log("find nearest attraction:" + nearest_attraction_result.id);
                            console.log(nearest_attraction_result.coordinates);
                            next(null, nearest_attraction_result);
                        }
                    }
                });
            },
            //get parkinglot
            function (nearest_attraction_result, next) {
                var coordinates_array = [];
                coordinates_array.push(nearest_attraction_result.coordinates);
                google_place_api_call(coordinates_array, WALKING_DISTANCE_MAX, null, function (error, parking_results) {
                    if (error != null) {
                        next(error);
                    } else {
                        parking_result = null;

                        // deterministic
                        // for (var i = 0; i < parking_results.length; i++) {
                        //     if (!found_parking.has(parking_results[i].place_id) && cal_distance([nearest_attraction_result.coordinates.latitude, nearest_attraction_result.coordinates.longitude], [parking_results[i].geometry.location.lat, parking_results[i].geometry.location.lng]) <= WALKING_DISTANCE_MAX) {
                        //         parking_result = parking_results[i];
                        //         break;
                        //     }
                        // }

                        //stochastic
                        for (var counter = 0; counter < 500; counter++) {
                            random_int = Math.floor(Math.random() * parking_results.length);
                            if (!found_parking.has(parking_results[random_int].place_id) && cal_distance([nearest_attraction_result.coordinates.latitude, nearest_attraction_result.coordinates.longitude], [parking_results[random_int].geometry.location.lat, parking_results[random_int].geometry.location.lng]) <= WALKING_DISTANCE_MAX) {
                                parking_result = parking_results[random_int];
                                break;
                            }
                        }
                        if (parking_result == null) {
                            next("parking lot are all chosen!");
                        } else {
                            console.log("find parking:" + parking_result.place_id);
                            console.log("find parking:" + parking_result.geometry.location);
                            next(null, nearest_attraction_result, parking_result);
                        }
                    }
                });
            },
            //get the attractions near parkinglot
            function (nearest_attraction_result, parking_result, next) {
                var parking_lat = parking_result.geometry.location.lat;
                var parking_lng = parking_result.geometry.location.lng;

                yelp_api_call(parking_lat, parking_lng, WALKING_DISTANCE_MAX, 20, categories, function (error, attraction_results) {
                    var group_attraction_results = [];

                    nearest_attraction_result.distance = cal_distance([nearest_attraction_result.coordinates.latitude, nearest_attraction_result.coordinates.longitude], [parking_result.geometry.location.lat, parking_result.geometry.location.lng]);
                    group_attraction_results.push(nearest_attraction_result);
                    found_attraction.add(nearest_attraction_result.id);

                    for (var i = 0; i < attraction_results.length; i++) {
                        if (!found_attraction.has(attraction_results[i].id) && attraction_results[i].distance <= WALKING_DISTANCE_MAX) {
                            group_attraction_results.push(attraction_results[i]);
                            found_attraction.add(attraction_results[i].id);
                        }
                    }

                    if (group_attraction_results.length == 0) {
                        next("no attractions around!");
                    } else {
                        console.log("find attractions near parking:");
                        for (var i = 0; i < group_attraction_results.length; i++) {
                            console.log(group_attraction_results[i].id);
                        }
                        next(error, group_attraction_results, parking_result);
                    }
                });
            },
            //get travel time between groups
            function (group_attraction_results, parking_result, next) {
                var propertiesObject = {
                    mode: "driving",
                    language: "en",
                    origins: query_lat.toString() + "," + query_lng.toString(),
                    destinations: parking_result.geometry.location.lat.toString() + "," + parking_result.geometry.location.lng.toString(),
                    key: GOOGLE_API_KEY,
                };
                Request({
                    url: "https://maps.googleapis.com/maps/api/distancematrix/json",
                    qs: propertiesObject
                }, function (error, response, body) {
                    if (error) {
                        next(error);
                    } else {
                        time_result = JSON.parse(body);
                        next(null, group_attraction_results, parking_result, time_result);
                    }
                });
            }
        ], function (err, group_attraction_results, parking_result, time_result) {
            if (err) {
                console.error(err);
                next();
            } else {
                var encapsulated_attraction = [];
                for (var i = 0; i < group_attraction_results.length; i++) {
                    encapsulated_attraction.push({
                        id: group_attraction_results[i].id,
                        name: group_attraction_results[i].name,
                        categories: group_attraction_results[i].categories,
                        coordinates: group_attraction_results[i].coordinates,
                        distance_from_parking: group_attraction_results[i].distance
                    });
                }
                var encasulated_parking = []
                encasulated_parking.push({
                    id: parking_result.place_id,
                    name: parking_result.name,
                    coordinates: parking_result.geometry.location,
                });

                res.json({
                    attractions: encapsulated_attraction,
                    parking: encasulated_parking,
                    travel_time: time_result.rows[0].elements[0].duration,
                    travel_distance: time_result.rows[0].elements[0].distance,
                    index: 0
                });
            }
        });
    },

    find_multiple_specified_attraction_groups: function (req, res, next) {
        console.log("receive query:");
        console.log(req.body);
        //var query_categories = req.body.categories;
        var start_lat = req.body.lat;
        var start_lng = req.body.lng;
        var num_of_groups = req.body.numberofgroups || 5;
        var attraction_ids = req.body.attraction_ids;
        var price = req.body.price;

        async.waterfall([
            function (next) {
                //bind attractions with parking
                async.map(attraction_ids, function (attraction_id, finish) {
                        var requestData = {
                            lat: start_lat,
                            lng: start_lng,
                            attraction_id: attraction_id
                        };
                        Request({
                            url: SELF_URL + "find_specified_attraction_group",
                            method: "post",
                            body: requestData,
                            json: true
                        }, (error, response, body) => {
                            if (error) {
                                finish(error);
                            } else {
                                finish(null, body);
                            }
                        });
                    },
                    //combine attractions and distance ranking 
                    function (err, attraction_groups) {
                        if (err) {
                            console.error(err);
                            next(err);
                            return;
                        } else {
                            //console.log(attraction_groups);
                            var hash_map = {};
                            for (var i = 0; i < attraction_groups.length; i++) {
                                var parking_id = attraction_groups[i].parking[0].id;
                                if (!hash_map.hasOwnProperty(parking_id)) {
                                    hash_map[parking_id] = attraction_groups[i];
                                } else {
                                    hash_map[parking_id].attractions = hash_map[parking_id].attractions.concat(attraction_groups[i].attractions);
                                }
                            }

                            //console.log(hash_map);

                            result = [];
                            var now_lat = start_lat;
                            var now_lng = start_lng;
                            while (Object.getOwnPropertyNames(hash_map).length > 0) {
                                nearest_parking_id = null;
                                min_distance = 2 * MAX_RADIUS;
                                for (var id in hash_map) {
                                    var now_distance = cal_distance([now_lat, now_lng], [hash_map[id].parking[0].coordinates.lat, hash_map[id].parking[0].coordinates.lng]);
                                    if (now_distance < min_distance) {
                                        min_distance = now_distance;
                                        nearest_parking_id = id;
                                    }
                                }
                                if (nearest_parking_id == null) {
                                    console.error("hashmap_error");
                                    next("hashmap_error");
                                    return;
                                }
                                console.log("travel to:\n" + hash_map[nearest_parking_id].attractions[0].name);
                                console.log(min_distance.toString() + "(m)");
                                result.push(hash_map[nearest_parking_id]);
                                now_lat = hash_map[nearest_parking_id].parking[0].coordinates.lat;
                                now_lng = hash_map[nearest_parking_id].parking[0].coordinates.lng;
                                delete hash_map[nearest_parking_id];
                            }
                            next(null, result);
                        }
                    });
            },
            //get travel time between groups
            function (result, next) {
                var start_end_coordinates_array = [];
                var now = [start_lat, start_lng];
                for (var i = 0; i < result.length; i++) {
                    start_end_coordinates_array.push([now, [result[i].parking[0].coordinates.lat, result[i].parking[0].coordinates.lng]]);
                    now = [result[i].parking[0].coordinates.lat, result[i].parking[0].coordinates.lng];
                }
                async.map(start_end_coordinates_array,
                    function (start_end_coordinates, finish) {
                        var propertiesObject = {
                            mode: "driving",
                            language: "en",
                            origins: start_end_coordinates[0][0].toString() + "," + start_end_coordinates[0][1].toString(),
                            destinations: start_end_coordinates[1][0].toString() + "," + start_end_coordinates[1][1].toString(),
                            key: GOOGLE_API_KEY,
                        };
                        Request({
                            url: "https://maps.googleapis.com/maps/api/distancematrix/json",
                            qs: propertiesObject
                        }, function (error, response, body) {
                            if (error) {
                                finish(error);
                            } else {
                                time_result = JSON.parse(body);
                                finish(null, time_result);
                            }
                        });
                    },
                    function (err, time_results) {
                        if (err) {
                            console.error(err);
                            next(err);
                            return;
                        } else {
                            for (var i = 0; i < result.length; i++) {
                                result[i].travel_time = time_results[i].rows[0].elements[0].duration;
                                result[i].travel_distance = time_results[i].rows[0].elements[0].distance;
                                result[i].index = i + 1;
                            }
                            next(null, result);
                        }
                    });
            }
        ], function (err, result) {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            } else {
                res.send(result);
            }
        });
    },

    find_specified_attraction_group: function (req, res, next) {
        var query_lat = req.body.lat;
        var query_lng = req.body.lng;
        var query_attraction_id = req.body.attraction_id;

        async.waterfall([
            //get the attraction detail
            function (next) {
                Request({
                    headers: {
                        'Authorization': 'Bearer ' + YELP_API_KEY
                    },
                    url: "https://api.yelp.com/v3/businesses/" + query_attraction_id,
                }, function (error, response, body) {
                    if (error) {
                        next(error);
                    } else {
                        attraction_result = JSON.parse(body);
                        console.log("find attraction detail:" + attraction_result.id);
                        console.log(attraction_result.name);
                        console.log(attraction_result.coordinates);
                        next(null, attraction_result);
                    }
                });
            },
            //get parkinglot
            function (attraction_result, next) {
                var coordinates_array = [];
                coordinates_array.push(attraction_result.coordinates);
                google_place_api_call(coordinates_array, null, "distance", function (error, parking_results) {
                    if (error != null) {
                        next(error);
                    } else {
                        parking_result = parking_results[0];
                        console.log("find parking:" + parking_result.place_id);
                        console.log("find parking:" + parking_result.geometry.location);
                        next(null, attraction_result, parking_result);
                    }
                });
            }
        ], function (err, attraction_result, parking_result) {
            if (err) {
                console.error(err);
                next();
            } else {
                attraction_result.distance = cal_distance([attraction_result.coordinates.latitude, attraction_result.coordinates.longitude], [parking_result.geometry.location.lat, parking_result.geometry.location.lng]);

                var encapsulated_attraction = [];
                encapsulated_attraction.push({
                    id: attraction_result.id,
                    name: attraction_result.name,
                    categories: attraction_result.categories,
                    coordinates: attraction_result.coordinates,
                    distance_from_parking: attraction_result.distance
                });

                var encasulated_parking = []
                encasulated_parking.push({
                    id: parking_result.place_id,
                    name: parking_result.name,
                    coordinates: parking_result.geometry.location,
                });

                res.json({
                    attractions: encapsulated_attraction,
                    parking: encasulated_parking
                });
            }
        });
    }
};

function yelp_api_call(lat, lng, radius, limit, categories, callback) {
    var propertiesObject = {
        term: "top tourist attractions",
        //location: "san francisco",
        latitude: lat,
        longitude: lng,
        radius: radius,
        limit: limit,
        categories: categories,
        sort_by: "best_match"
    };
    Request({
        headers: {
            'Authorization': 'Bearer ' + YELP_API_KEY
        },
        url: "https://api.yelp.com/v3/businesses/search",
        qs: propertiesObject
    }, function (error, response, body) {
        if (error) {
            callback(error);
        } else {
            result = JSON.parse(body);
            console.log("radius:", radius);
            console.log("numberfound:", result.businesses.length);
            if (result.businesses.length == 0) {
                callback("cannot find an attraction!")
            } else {
                attraction_results = result.businesses;
                callback(null, attraction_results);
            }
        }
    });
}

function google_place_api_call(coordinates_array, radius, rankby, callback) {
    async.map(coordinates_array, function (coordinate, finish) {
        attr_lat = coordinate.latitude;
        attr_lng = coordinate.longitude;

        var propertiesObject = {
            location: attr_lat.toString() + "," + attr_lng.toString(),
            type: "parking",
            key: GOOGLE_API_KEY,
        };
        if (radius != null) {
            propertiesObject.radius = radius;
            console.log("radius:", radius);
        }
        if (rankby != null) {
            propertiesObject.rankby = rankby;
            console.log("rankby:", rankby);
        }
        Request({
            url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
            qs: propertiesObject
        }, (error, response, body) => {
            if (error) {
                finish(error);
            } else {
                result = JSON.parse(body);
                parking_result = {};
                console.log("numberfound:", result.results.length);
                if (result.results.length == 0) {
                    finish("cannot find a parking!");
                }

                else {
                    parking_results = result.results;
                    finish(null, parking_results);
                }
            }
        });
    }, function (err, parking_results_all) {
        if (err) {
            callback(err);
        } else {
            callback(null, parking_results_all[0]);
        }
    });
}

function cal_distance(coordinate1, coordinate2) {
    distance_lat = (coordinate1[0] - coordinate2[0]) * km_per_latitude * 1000;
    distance_lng = (coordinate1[1] - coordinate2[1]) * km_per_longitude * 1000;
    return Math.sqrt(Math.pow(distance_lat, 2) + Math.pow(distance_lng, 2));
}