(function(service, domIds) {
	"use strict";

	var _images = [], _lightbox;
	var lbImageHspace = 80; // leave 80px horizontal space for nav
	var lbImageVspace = 60; // leave 60px vertical space for breathing room, title bar

	// Handle browsers that dispatch a lot of window resize events with requestAnimationFrame
	(function() {
		var running = false;
        window.addEventListener("resize", function() {
        	if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
            	if (_lightbox && _lightbox.visible) {
	            	setLightboxImageSize();
	            }
                running = false;
            });
        });
	})();

	// Render (or refresh) an IMG tag
	function renderImage(image, imgDom) {
		imgDom = imgDom || document.createElement("img");
		imgDom.setAttribute("src", image.url);
		imgDom.setAttribute("height", image.height);
		imgDom.setAttribute("width", image.width);
		return imgDom;
	}

	// Render a thumbnail
	function renderListItem(item, i) {
		var itemDom = document.createElement("li");
		itemDom.className = "image-list-item";

		var linkDom = document.createElement("a");
		linkDom.setAttribute("href", item.image.url);
		linkDom.setAttribute("data-idx", i);
		linkDom.className = "image-list-link";
		
		var imgDom = renderImage(item.thumbnail);
		imgDom.setAttribute("title", item.title); // remember accessibility
		linkDom.appendChild(imgDom);
		itemDom.appendChild(linkDom);

		return itemDom;
	}

	// Render the thumbnail list
	function renderList(list) {
		_images = list;
		var dom = document.getElementById(domIds.list);

		// Clear any previous data
		dom.innerHTML = "";

		// Build out the new DOM
		var item, listDom = document.createElement("div");
		for (var i=0; i < list.length; i++) {
			item = list[i];
			if (item && item.id) {
				listDom.appendChild(renderListItem(item, i));
			}
		}

		dom.appendChild(listDom);
	}

	function renderError(msg) {
		var dom = document.getElementById(domIds.list);
		dom.innerHTML = "";
		dom.appendChild(document.createTextNode(msg));
	}

	// Render the < > lightbox navigation buttons
	function renderLightboxNav() {
		var prevButtonDom = document.createElement("button");
		prevButtonDom.appendChild(document.createTextNode("<"));
		prevButtonDom.className = "lb-lightbox-nav lb-lightbox-prev";
		
		var nextButtonDom = document.createElement("button");
		nextButtonDom.appendChild(document.createTextNode(">"));
		nextButtonDom.className = "lb-lightbox-nav lb-lightbox-next";

		return {prev: prevButtonDom, next: nextButtonDom};
	}

	// Update the button state to reflect whether or not there's actually a
	// next or previous item
	function setLightboxNav(nav,idx) {
		nav.prev.classList.toggle("disabled", idx < 1);
		nav.next.classList.toggle("disabled", idx >= _images.length - 1);
	}

	// We want the image to fit in the viewport.
	// This function will size the image appropriately for the current screen.
	// Called when the image changes, or when the window's resized or device
	// orientation changes.
	function setLightboxImageSize() {
		var dom = _lightbox.$img;
		var image = _images[_lightbox.idx].image;
		var maxWidth = document.body.clientWidth - lbImageHspace,
			maxHeight = window.innerHeight - lbImageVspace,
			ratio = 1;
		if (image.width > maxWidth) {
			ratio = maxWidth/image.width;
			if (image.height > maxHeight) {
				// Figure out which max matters
				if (ratio > (maxHeight/image.height)) {
					ratio = maxHeight/image.height;
				}
			}
		} else if (image.height > maxHeight) {
			ratio = maxHeight/image.height;
		}
		dom.style.width = Math.floor(ratio * image.width)+"px";
		dom.style.height = Math.floor(ratio * image.height)+"px";
	}

	// Set the lightbox image src plus its dimensions.
	function setLightboxImage() {
		var dom = _lightbox.$img;
		var image = _images[_lightbox.idx].image;
		renderImage(image, dom);
		setLightboxImageSize();
	}

	// Call this after you update _lightbox.idx
	function refreshLightbox() {
		if (_lightbox) {
			var item = _images[_lightbox.idx];
			_lightbox.$titleText.nodeValue = item.title || "";
			_lightbox.$img.classList.add("loading");
			setLightboxImage();
			setLightboxNav(_lightbox.$nav, _lightbox.idx);
		}
	}

	function gotoPreviousImage() {
		if (_lightbox.idx > 0) {
			_lightbox.idx--;
			refreshLightbox();
		}
	}

	function gotoNextImage() {
		if (_lightbox.idx < _images.length-1) {
			_lightbox.idx++;
			refreshLightbox();
		}
	}

	// Render the lightbox to display the image at index idx.
	// This will generate the DOM if it hasn't already been done.
	function renderLightbox(idx) {
		var dom, overlay, titleId = "lb-title";

		if (!_lightbox) {
			dom = document.createElement("div");
			dom.setAttribute("id", domIds.lightbox);
			// Listen for the image load event so we can do neat fade effects
			dom.addEventListener("load", function(event) {
				var target = event.target;
				if (target && target.nodeName === "IMG") {
					target && target.classList.remove("loading");
				}
			}, true);

			// We put this event handler on the body so keys will still work even if the
			// lightbox ends up losing focus.
			document.body.addEventListener("keydown", function(event) {
				if (!_lightbox.visible) {
					return;
				}

				var keycode = event.keyCode || event.which;
				if (keycode === 27) { // Escape
					showLightbox(false);
					event.preventDefault();
				}
				if (keycode === 37) { // left
					gotoPreviousImage();
					event.preventDefault();
				}
				if (keycode === 39) { // right
					gotoNextImage();
					event.preventDefault();
				}
			}, true);

			overlay = document.createElement("div");
			overlay.setAttribute("id", domIds.overlay);
			overlay.addEventListener("click", function(event) {
				showLightbox(false);
			}, false);

			var boxDom = document.createElement("div");

			var titleDom = document.createElement("div");
			titleDom.className = "lb-title";
			titleDom.setAttribute("id", titleId);

			var titleText = document.createTextNode("");
			titleDom.appendChild(titleText);

			// Typically, the user will click outside the image to clear the lightbox.
			// Users that are using the keyboard need a way to clear the lightbox too, though.
			// This close button only shows up when it's focused.
			var closeButton = document.createElement("button");
			var closeText = document.createTextNode("Close");
			closeButton.appendChild(closeText);
			closeButton.className = "lb-lightbox-close";
			closeButton.addEventListener("click", function(event) {
				showLightbox(false);
			}, false);
			titleDom.appendChild(closeButton);

			var imgDom = document.createElement("img");
			imgDom.className = "lb-image";
			imgDom.setAttribute("aria-labelledby",titleId);

			var nav = renderLightboxNav();

			nav.prev.addEventListener("click", function(event) {
				gotoPreviousImage();
			});
			nav.next.addEventListener("click", function(event) {
				gotoNextImage();
			});

			boxDom.appendChild(titleDom);
			boxDom.appendChild(imgDom);
			boxDom.appendChild(nav.prev);
			boxDom.appendChild(nav.next);

			dom.appendChild(boxDom);

			_lightbox = {
				$lightbox: dom,
				$overlay: overlay,
				$nav: nav,
				$titleText: titleText,
				$img: imgDom,
				idx: idx,
				visible: false
			}
		} else {
			_lightbox.idx = idx;
		}

		refreshLightbox();

		if (overlay) {
			document.body.appendChild(overlay);
		}
		if (dom) {
			document.body.appendChild(dom);
		}

		showLightbox();
	}

	function showLightbox(show) {
		show = show !== false;
		var display = "block";
		if (!show) {
			display = "none";
		}
		_lightbox.$lightbox.style.display = display;
		_lightbox.$overlay.style.display = display;

		if (!_lightbox.visible && show) {
			// Let's be nice and focus on the next button for our keyboard users.
			// Unless it's disabled, in which case the previous button.
			// Unless that's disabled too, in which case forget it.
			if (!_lightbox.$nav.next.classList.contains("disabled")) {
				_lightbox.$nav.next.focus();
			} else if (!_lightbox.$nav.prev.classList.contains("disabled")) {
				_lightbox.$nav.prev.focus();
			}
		}

		_lightbox.visible = show;
	}

	service.getList({
		complete: renderList,
		error: renderError
	});

	var listDom = document.getElementById(domIds.list);

	// Clicking thumbnails will bring up the image lightbox; it just makes sense!
	listDom.addEventListener("click", function(event) {
		var target = event.target;
		while (target && target.nodeName !== "A") {
			target = target.parentElement;
		}
		if (target) {
			var idx = target.getAttribute("data-idx");
			if (idx === undefined) { return; }
			idx = parseInt(idx, 10);
			event.preventDefault();
			renderLightbox(idx);
		}
		
	}, false);

	// Listen for thumbnail image load events, and fade them in for a nice gentle loading effect.
	listDom.addEventListener("load", function(event) {
		var target = event.target;
		if (target && target.nodeName === "IMG") {
			while (target && target.nodeName !== "LI") {
				target = target.parentElement;
			}
			target && target.classList.add("loaded");
		}
	}, true);
})(services.flickr, {list: "lb-list", lightbox: "lb-lightbox", overlay: "lb-overlay"});