global.config = require("./config");

const redis = require('ioredis');
global.Boom = require('@hapi/boom')

const mongoose = require("mongoose");
global.mongoose = mongoose;
mongoose.connect('mongodb://' + config.dbhost + '/richmedia', config.dboptions);

global.randomId = require('random-id');
global._ = require('lodash/core');

global.hashids = require('hashids/cjs');
global.redisClient = new redis.createClient()
