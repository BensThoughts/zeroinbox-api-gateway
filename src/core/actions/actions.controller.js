// const logger = require('../../libs/loggers/log4js');
const {publishActions} = require('../../libs/utils/rabbit.utils');


/**
 * actionsObj - {
 *  actionType: string,
 *  filter: boolean,
 *  labelName: string,
 *  category: string,
 *  unsubscribeWeb: string,
 *  unsubscribeEmail: string,
 * }
 */

exports.postActions = function(req, res) {
  const userId = req.session.userInfo.userId;
  const accessToken = req.session.token.accessToken;

  const body = req.body;

  // logger.trace(userId + ' - POST request to /v1/actions received: ' +
  // JSON.stringify(body));

  const senderIds = body.senderIds;
  const actionType = body.actionType;
  const filter = body.filter;
  const category = body.category;
  const labelName = body.labelName;
  const unsubscribeEmail = body.unsubscribeEmail;
  const unsubscribeWeb = body.unsubscribeWeb;

  const actionsObj = {
    actionType: actionType,
    filter: filter,
    category: category,
    labelName: labelName,
    unsubscribeEmail: unsubscribeEmail,
    unsubscribeWeb: unsubscribeWeb,
  };

  publishActions(userId, accessToken, actionsObj, senderIds);

  res.status(200).json({
    status: 'success',
    status_message: 'OK',
  });
};
