// Wrap raw XHRs in something slightly more friendly
(function(exports) {
	exports.ajax = {
		get: function(url, options) {
			var xhr = new XMLHttpRequest();

			xhr.onload = function() {
				options.complete && options.complete(xhr.response);
			}
			xhr.onerror = function() {
				// bad
			}

			xhr.open("GET",url);
			xhr.responseType = "json";
			xhr.send();
		},
		post: function(url, options) {

		}
	};
})(utils);