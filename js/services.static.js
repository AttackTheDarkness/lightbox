// Little static service to get a couple imgur images.
(function(exports) {
	var static = {
		getList: function(options) {
			var data = [
				{
					"id": "ztJfT7Qb",
					"title": "R-r-remix",
					"thumbnail": {
						"url": "http://i.imgur.com/ztJfT7Qb.jpg",
						"height": 160,
						"width": 160
					},
					"image": {
						"url": "http://i.imgur.com/ztJfT7Q.gif",
						"height": 482,
						"width": 460
					}
				},
				{
					"id": "gyKy4LJ",
					"title": "ugh",
					"thumbnail": {
						"url": "http://i.imgur.com/gyKy4LJ.jpg",
						"height": 160,
						"width": 160
					},
					"image": {
						"url": "http://i.imgur.com/gyKy4LJ.jpg",
						"height": 552,
						"width": 552
					}
				}
			];
			setTimeout(function() { options.complete(data); }, 0);
		}
	};
	exports.static = static;
})(services);