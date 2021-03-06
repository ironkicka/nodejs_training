var express = require('express');
var router = express.Router();

var knex = require('knex')({
  dialect: 'sqlite3',
  connection: {
    filename: 'board_data.sqlite3'
  },
  useNullAsDefault: true
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('pagination');

var User = Bookshelf.Model.extend({
  tableName: 'users'
});

var Message = Bookshelf.Model.extend({
  tableName: 'messages',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo(User);
  }
});


/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.login == null) {
    res.redirect('/users');
  } else {
    res.redirect('/page1');
  }
  console.log('done');
});

router.get('/page:page', (req, res, next) => {
  if (req.session.login == null) {
    res.redirect('/users');
    return;
  }

  var pg = req.params.page;
  console.log(pg);
  pg *= 1;
  if (pg < 1) { pg = 1; }
  new Message().orderBy('created_at', 'DESC')
    .fetchPage({ page: pg, pageSize: 10, withRelated: ['user'] })
    .then((collection) => {
      var data = {
        title: 'miniboard',
        login: req.session.login,
        collection: collection.toArray(),
        pagination: collection.pagination
      };
      console.log(data)
      res.render('index', data);
    }).catch((err) => {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
});

router.post('/', (req, res, next) => {
  var rec = {
    message: req.body.msg,
    user_id : req.session.login.id
  }

  new Message(rec).save().then((model) => {
    res.redirect('/');
  });
})
module.exports = router;
