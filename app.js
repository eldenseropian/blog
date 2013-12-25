var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;

var app = module.exports = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({src: __dirname + '/public'}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

var articleProvider = new ArticleProvider('localhost', 27017);

app.get('/', function(request, response) {
  response.redirect('/blog');
});

app.get('/blog', function(request, response) {
  articleProvider.findAll(function(error, docs) {
    response.render('index.jade', {title: 'Blog', articles: docs});
  });
});

app.get('/blog/new', function(request, response) {
  response.render('blog_new.jade', {title: 'New Post'});
});

app.post('/blog/new', function(request, response) {
  articleProvider.save({
      title: request.param('title'),
      body: request.param('body')
  }, function(error, docs) {
    response.redirect('/blog');
  });
});

app.get('/blog/delete', function(request, response) {
  articleProvider.deleteAllPosts(function(error) {
    response.redirect('/blog');
  });
});

app.get('/blog/:id', function(request, response) {
  articleProvider.findById(request.params.id, function (error, article) {
    response.render('blog_show.jade', {title: article.title, article: article});
  });
});

app.post('/blog/addComment', function(request, response) {
  articleProvider.addCommentToArticle(request.param('_id'), {
    person: request.param('person'),
    comment: request.param('comment'),
    created_at: new Date()
  }, function(error, docs) {
    response.redirect('/blog/' + request.param('_id'));
  });
});

var listening_app = app.listen(3000);

console.log('Express server listening on port %d in %s mode',
    listening_app.address().port, app.settings.env);
