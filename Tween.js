var tween = {

	animations: [],
	running: false,
	//progress: 0,

	animate: function(object, process) {
		var epochSeconds = new Date().getTime();
		var animation = {
			start: epochSeconds,
			object: object,
			process: JSON.parse(JSON.stringify(process)),	// Hacky shortcut to copy simple object
		};
		animation.process.origValue = {};
		Object.keys(process.val).forEach(function(key) {
			animation.process.origValue[key] = object[process.prop][key];
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

			//console.log(anim.start, currentTime);

			Object.keys(anim.process.val).forEach(function(key) {
				var fraction = (currentTime - anim.start) / anim.process.time;
				var originalValue = anim.process.origValue[key];
				var targetValue = anim.process.val[key];
				var currentValue = ((targetValue - originalValue) * fraction) + originalValue;

				console.log(key, originalValue + '->' + targetValue, self.progress, fraction, '=', currentValue);
				if(fraction < 1) {
					anim.object[anim.process.prop][key] = currentValue;
					//console.log("incremented anim", animIndex, anim.object.name, anim.process.prop, anim.process.val);
				}
				else {
					anim.object[anim.process.prop][key] = anim.process.val[key];
					self.animations.splice(animIndex,1);
					//console.log("removed anim", animIndex, anim.object.name, anim.process.prop, anim.process.val);

					if(!self.animations.length) {
						//console.log('finished all animations - auto-stopping');
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