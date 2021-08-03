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

exports.addToCategories = function(userId, category, callback) {
  let conditions = { userId: userId };
  let options = {
    upsert: true,
    multi: false
  }
  
  let update = {
    // userId: userId,
    "$addToSet": {
      categories: category
    }
  }

  Categories.updateOne(conditions, update, options, (err, res) => {
    callback(err, res);
  });
}

exports.removeCategory = function(userId, category, callback) {
  let conditions = { userId: userId }
  let options = {
    upsert: true,
    multi: false
  }
  let update = {
    "$pull": {
      categories: category
    }
  }

  Categories.updateOne(conditions, update, options, (err, res) => {
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
        "threadIds": 1,
        "messageIds": 1,
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

exports.findRefreshToken = function(userId, callback) {
    let conditions = { userId: userId }
    let projection = {
        "active.session.refreshToken": 1,
        _id: 0
    }

    History.findOne(conditions, projection, (err, res) => {
      if (err) {
        callback(err, res);
      } else if (res === null) {
        let errorMessage = 'Refresh token for ' + userId + ' not found!';
        callback(errorMessage, res);
      } else {
        let refreshToken = res.active.session.refreshToken;
        callback(err, refreshToken);
      }
    });
}