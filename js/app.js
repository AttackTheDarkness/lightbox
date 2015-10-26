(function(service, domIds) {
	"use strict";

	var _images = [];
	var lbImageHspace = 80; // leave 80px horizontal space for nav
	var lbImageVspace = 60; // leave 60px vertical space for breathing room, title bar

	function renderImage(img, imgDom) {
		imgDom = imgDom || document.createElement("img");
		imgDom.setAttribute("src", img.url);
		imgDom.setAttribute("height", img.height);
		imgDom.setAttribute("width", img.width);
		return imgDom;
	}

	function renderListItem(item, i) {
		var itemDom = document.createElement("a");
		itemDom.setAttribute("href", item.image.url);
		itemDom.setAttribute("data-idx", i);
		itemDom.className = "image-list-item";

		
		var imgDom = renderImage(item.thumbnail);
		imgDom.setAttribute("title", item.title); // remember accessibility
		itemDom.appendChild(imgDom);

		return itemDom;
	}

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

	function renderLightboxNav(idx) {
		var prevButtonDom = document.createElement("button");
		prevButtonDom.appendChild(document.createTextNode("<"));
		prevButtonDom.className = "lb-lightbox-nav lb-lightbox-prev";
		
		var nextButtonDom = document.createElement("button");
		nextButtonDom.appendChild(document.createTextNode(">"));
		nextButtonDom.className = "lb-lightbox-nav lb-lightbox-next";

		return {prev: prevButtonDom, next: nextButtonDom};
	}

	function setLightboxNav(nav,idx) {
		nav.prev.classList.toggle("disabled", idx < 1);
		nav.next.classList.toggle("disabled", idx >= _images.length - 1);
	}

	function setLightboxImageMax(dom, item) {
		var maxWidth = document.body.clientWidth - lbImageHspace,
			maxHeight = window.innerHeight - lbImageVspace,
			ratio = 1;
		if (item.width > maxWidth) {
			ratio = maxWidth/item.width;
			if (item.height > maxHeight) {
				// Figure out which max matters
				if (ratio > (maxHeight/item.height)) {
					ratio = maxHeight/item.height;
				}
			}
		} else if (item.height > maxHeight) {
			ratio = maxHeight/item.height;
		}
		dom.style.width = ratio * item.width+"px";
		dom.style.height = ratio * item.height+"px";
	}

	function renderLightbox(idx) {
		var item = _images[idx];

		var dom = document.getElementById(domIds.lightbox), appendLightbox = false;
		if (!dom) {
			dom = document.createElement("div");
			dom.setAttribute("id", "lb-lightbox");
			dom.addEventListener("load", function(event) {
				var target = event.target;
				if (target && target.nodeName === "IMG") {
					target && target.classList.remove("loading");
				}
			}, true);
			appendLightbox = true;
		}

		// Clear any previous data
		dom.innerHTML = "";

		// Build out the new DOM
		var boxDom = document.createElement("div");

		var titleDom = document.createElement("div");
		titleDom.className = "lb-title";

		var titleText = document.createTextNode(item.title);
		titleDom.appendChild(titleText);

		var closeButton = document.createElement("button");
		var closeText = document.createTextNode("Close");
		closeButton.appendChild(closeText);
		closeButton.className = "lb-lightbox-close";
		closeButton.addEventListener("click", function(event) {
			closeLightbox();
		}, false);
		titleDom.appendChild(closeButton);

		var imgDom = renderImage(item.image);
		imgDom.className = "lb-image loading";
		setLightboxImageMax(imgDom, item.image);

		var nav = renderLightboxNav(idx);
		setLightboxNav(nav, idx);

		function refreshLightbox() {
			item = _images[idx];
			titleText.nodeValue = item.title || "";
			imgDom.classList.add("loading");
			imgDom = renderImage(item.image, imgDom);
			setLightboxImageMax(imgDom, item.image);
			setLightboxNav(nav, idx);
		}

		nav.prev.addEventListener("click", function(event) {
			if (idx > 0) {
				idx--;
				refreshLightbox();
			}
		});
		nav.next.addEventListener("click", function(event) {
			if (idx < _images.length-1) {
				idx++;
				refreshLightbox();
			}
		});

		boxDom.appendChild(titleDom);
		boxDom.appendChild(imgDom);
		boxDom.appendChild(nav.prev);
		boxDom.appendChild(nav.next);

		dom.appendChild(boxDom);

		dom.style.display = "block";

		if (appendLightbox) {
			document.body.appendChild(dom);
		}
	}
	function closeLightbox() {
		var dom = document.getElementById(domIds.lightbox);
		dom.innerHTML = "";
		dom.style.display = "none";
	}

	service.getList({complete: renderList});
	var listDom = document.getElementById(domIds.list);
	listDom.addEventListener("click", function(event) {
		var target = event.target;
		while (target && target.nodeName !== "A") {
			target = target.parentElement;
		}
		if (target) {
			var idx = target.getAttribute("data-idx");
			if (idx === undefined) { return; }
			idx = parseInt(idx);
			event.preventDefault();
			renderLightbox(idx);
		}
		
	}, false);
	listDom.addEventListener("load", function(event) {
		var target = event.target;
		if (target && target.nodeName === "IMG") {
			while (target && target.nodeName !== "A") {
				target = target.parentElement;
			}
			target && target.classList.add("loaded");
		}
	}, true);
})(services.flickr, {list: "lb-list", lightbox: "lb-lightbox"});