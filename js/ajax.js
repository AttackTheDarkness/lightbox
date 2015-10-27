// Wrap raw XHRs in something slightly more friendly
(function(exports) {
	exports.ajax = {
		get: function(url, options) {
			var xhr = new XMLHttpRequest();

			xhr.onload = function() {
				options.complete && options.complete(xhr.response);
			}
			xhr.onerror = function() {
				options.error && options.error("Flickr doesn't want to talk to us right now. Try again later.");
			}

			xhr.open("GET",url);
			xhr.responseType = "json";
			xhr.send();
		}
	};
})(utils);