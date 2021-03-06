var keystone = require('keystone');
var async = require('async');
var Post = keystone.list('Post');
var PostCategory = keystone.list('PostCategory');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;


	locals.section = 'blog';
	locals.filters = {
		category: req.params.category,
	};
	locals.posts = [];
	locals.categories = [];


	view.on('init', function (next) {

		PostCategory.model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.categories = results;
			console.log(categories);

		
			async.each(locals.categories, function (category, next) {

				keystone.list('Post').model.count().where('state', 'published').where('categories').in([category.id]).exec(function (err, count) {
					category.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});

		});

	});

	view.on('init', function (next) {
		if (req.params.category) {
			PostCategory.model.findOne({ key: locals.filters.category }).exec(function (err, result) {
				locals.category = result;
				next(err);
			});
		} else {
			next();
		}
	});


	view.on('init', function (next) {

		var q = Post.paginate({
				page: req.query.page || 1,
 				perPage: 10,
 				maxPages: 10,
			})
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author categories');

		if (locals.category) {
			q.where('categories').in([locals.category]);
		}

		q.exec(function (err, results) {
			locals.posts = results;
			next(err);
		});

	});

	view.render('blog');

}