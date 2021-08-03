const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionSchema = new Schema({
  userId: {type: String, required: true},
  senderId: {type: String, required: true},
  action: {
    type: String,
    required: [true, 'Action of label or delete is required!'],
    validate: {
      validator: function(action) {
        switch (action) {
          case 'label':
            return true;
          case 'delete':
            return true;
          default:
            return false;
        }
      },
      message: (props) => {
        return `${props.value} is not a valid action (try label or delete)!`;
      },
    },
  },
});

const Action = mongoose.model('action', actionSchema);

module.exports = Action;
