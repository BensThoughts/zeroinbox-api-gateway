const logger = require('../loggers/log4js');

const History = require('../../models/history.model');
const Profile = require('../../models/profile.model');
const Sender = require('../../models/sender.model');
const LoadingStatus = require('../../models/loading.model');
const Categories = require('../../models/categories.model');

const {
    DEFAULT_PERCENT_LOADED
  } = require('../../config/init.config');

exports.findCategories = function(userId, callback) {
  let conditions = { userId: userId };
  let projection = {
    _id: 0,
    'categories.name': 1,
    'categories.value': 1 
  }
  Categories.findOne(conditions, projection, (err, doc) => {
    callback(err, doc);
  });
}

exports.updateCategories = function(userId, categories, callback) {
  let conditions = { userId: userId };
  let options = {
    upsert: true,
    multi: false
  }
  
  let doc = {
    userId: userId,
    categories: categories
  }

  Categories.updateOne(conditions, doc, options, (err, res) => {
    callback(err, res);
  });
}


exports.upsertToHistory = function upsertToHistory(userId, doc, callback) {
    let conditions = { userId: userId }
    let options = {
        upsert: true,
        mutli: false
    }
    History.updateOne(conditions, doc, options, (err, doc) => {
        if (callback) {
            callback(err, doc);
        } else if (err) {
            logger.error('Error in History.updateOne(): ' + err);
        }
    });
}

exports.findOneHistory = function(userId, callback) {
    let conditions = { userId: userId };
    History.findOne(conditions, (err, doc) => {
        callback(err, doc);
    });
}

exports.upsertToProfile = function(userId, doc, callback) {
    let conditions = { userId: userId }
    let options = {
        upsert: true,
        multi: false
    }
    Profile.updateOne(conditions, doc, options, (err, doc) => {
        if (callback) {
            callback(err, doc);
        } else if (err) {
            logger.error('Error in Profile.updateOne(): ' + err);
        }
    });
}




exports.findSenders = function(userId, callback) {
    let conditions = {
        userId: userId,
    }
    let senderProjection = {
        "senderAddress": 1,
        "senderNames": 1,
        "totalSizeEstimate": 1,
        "unsubscribeEmail": 1,
        "unsubscribeWeb": 1,
        "unsubscribed": 1,
        "senderId": 1,
        "count": 1,
        _id: 0
    };
    Sender.find(conditions, senderProjection, (err, raw) => {
        callback(err, raw);
    });
}


exports.findOneLoadingStatus = function(userId, callback) {
    let conditions = { userId: userId };
    LoadingStatus.findOne(conditions, (err, doc) => {
        callback(err, doc);
    });
}

exports.updateLoadingStatus = function(userId, callback) {
    let conditions = { userId: userId }
    let update = {
        'loadingStatus': true,
        'percentLoaded': DEFAULT_PERCENT_LOADED
    }
    let options = {
        upsert: true,
        multi: false
    }
    LoadingStatus.updateOne(conditions, update, options, (err, raw) => {
        callback(err, raw);
    })    
}

exports.findStoredSession = function(userId, callback) {
    let conditions = { userId: userId }
    let projection = {
        "active.session": 1,
        _id: 0
    }

    History.findOne(conditions, projection, (err, res) => {
        callback(err, res);
    });
}

exports.lockActionsPipeline = function(userId, callback) {
  let conditions = { userId: userId }
  let update = {
    actionsLock: true
  }
  LoadingStatus.updateOne(conditions, update, (err, res) => {
    callback(err, res);
  });
}
