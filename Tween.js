var tween = {

	animations: [],
	running: false,
	//progress: 0,

	animate: function(object, target) {
		var epochSeconds = new Date().getTime();
		var animation = {
			start: epochSeconds,
			object: object,
			target: target,
			origValue: {}
		};
		Object.keys(target.val).forEach(function(key) {
			animation.origValue[key] = object[target.prop][key];
		});
		this.animations.push(animation);
		console.log(animation);
	},

	render: function() {
		currentTime = new Date().getTime();
		var self = this;
		self.animations.forEach(function(anim, animIndex) {
			
			// Step-by-step debug
			/*self.progress++;
			currentTime = anim.start + (self.progress * 250);*/

			console.log(anim.start, currentTime);

			Object.keys(anim.target.val).forEach(function(key) {
				var fraction = (currentTime - anim.start) / anim.target.time;
				var originalValue = anim.origValue[key];
				var targetValue = anim.target.val[key];
				var currentValue = ((targetValue - originalValue) * fraction) + originalValue;

				console.log(key, originalValue + '->' + targetValue, self.progress, fraction, '=', currentValue);
				if(fraction < 1) {
					anim.object[anim.target.prop][key] = currentValue;
					console.log("incremented anim", animIndex, anim.object.name, anim.target.prop, anim.target.val);
				}
				else {
					anim.object[anim.target.prop][key] = anim.target.val[key];
					self.animations.splice(animIndex,1);
					console.log("removed anim", animIndex, anim.object.name, anim.target.prop, anim.target.val);

					if(!self.animations.length) {
						console.log('finished all animations - auto-stopping');
						self.stop();
					}
				}
				
			});
		});

		if(this.running) {
			window.requestAnimationFrame(this.render.bind(this));
		}
	},

	start: function() {
		this.running = true;
		this.render();
	},

	stop: function() {
		this.running = false;
	}
};