var ui = {
	elements: {},
	add: function(id, element) {

		element.classList.add("ui");

		var elLeft = element.cloneNode(true);
		var elRight = element.cloneNode(true);
		
		elLeft.classList.add("left");
		elRight.classList.add("right");
		
		document.body.appendChild(elLeft);
		document.body.appendChild(elRight);

		this.elements[id] = { left:elLeft, right:elRight };

		return this.elements[id];
	},
	remove: function(id) {
		var old = this.elements[id];
		delete(this.elements[id]);
		return old;
	},
	setHTML: function(elements, html) {
		this.toArray(elements).forEach(function(element) {
			element.innerHTML = html;
		});
	},
	fadeIn: function(elements, time, callback) {

		time = time || "1s";

		this.toArray(elements).forEach(function(element) {
			
			if(callback) {
				function transitionEnd(event) {
					element.removeEventListener("transitionend", transitionEnd);
					callback(element, event);
				}

				element.addEventListener("transitionend", transitionEnd);
			}

			element.style.transition = "opacity "+time;
			element.style.opacity = 1;
		});
	},
	fadeOut: function(elements, time, callback) {
		time = time || "1s";

		this.toArray(elements).forEach(function(element) {
			
			if(callback) {
				function transitionEnd(event) {
					element.removeEventListener("transitionend", transitionEnd);
					callback(element, event);
				}

				element.addEventListener("transitionend", transitionEnd);
			}

			element.style.transition = "opacity "+time;
			element.style.opacity = 0;
		});
	},
	hide: function(elements) {
		this.toArray(elements).forEach(function(element) {
			element.style.display = "none";
		});
	},
	show: function(elements) {
		this.toArray(elements).forEach(function(element) {
			element.style.display = "block";
		});
	},
	toArray: function(thing) {
		var newArray;

		if(typeof thing === "string") {
			thing = this.elements[thing];
		}

		if(thing.left && thing.right) {
			newArray = [thing.left, thing.right];
		}
		else if((thing instanceof Array) || (thing instanceof NodeList) || (thing instanceof Array)) {
			newArray = Array.prototype.slice.call(thing);
		}
		else {
			newArray = [thing];
		}
		return newArray;
	}

};