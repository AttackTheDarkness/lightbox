(function(exports, utils){
	var clientKey = "3e763b70fb7836e9480c58a956a9a92d";

	var flickr = {
		getList: function(options) {
			var page = 1;
			var url = "https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key={clientKey}&per_page=50&page={page}&format=json&nojsoncallback=1&extras=url_t,url_l,description";
			url = url.replace(/{clientKey}/,clientKey).replace(/{page}/, page);
			utils.ajax.get(url, {
				complete: function(data) {
					if (data && data.photos) {
						var photos = data.photos.photo;
						var xlatedPhotos = [];
						var i, photo;
						for (i=0; i<photos.length; i++) {
							photo = photos[i];
							xlatedPhotos.push({
								id: photo.id,
								title: photo.title,
								image: {
									url: photo.url_l,
									width: photo.width_l,
									height: photo.height_l
								},
								thumbnail: {
									url: photo.url_t,
									width: photo.width_t,
									height: photo.height_t
								}
							});
						}
						options.complete(xlatedPhotos);
					} else {
						// bad
					}
				}
			});
		}
	};

	exports.flickr = flickr;
})(services, utils);