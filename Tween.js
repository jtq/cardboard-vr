var tween = {

	animations: [],
	running: false,
	//progress: 0,

	animate: function(object, processes) {
		var epochSeconds = new Date().getTime();
		var animation = {
			start: epochSeconds,
			object: object,
			processes: JSON.parse(JSON.stringify(processes)),	// Hacky shortcut to copy simple object
		};

		animation.processes.forEach(function(process) {
			process.origValue = {};

			Object.keys(process.val).forEach(function(key) {
				process.origValue[key] = object[process.prop][key];
			});
		});
		
		this.animations.push(animation);
		//console.log(animation);
	},

	render: function() {
		currentTime = new Date().getTime();
		var self = this;
		self.animations.forEach(function(anim, animIndex) {
			
			// Step-by-step debug
			/*self.progress++;
			currentTime = anim.start + (self.progress * 250);*/

			//console.log(anim.start, currentTime);

			anim.processes.forEach(function(process, processIndex) {

				var fraction = (currentTime - anim.start) / process.time;

				Object.keys(process.val).forEach(function(key) {
					var originalValue = process.origValue[key];
					var targetValue = process.val[key];
					var currentValue = ((targetValue - originalValue) * fraction) + originalValue;

					//console.log(key, originalValue + '->' + targetValue, self.progress, fraction, '=', currentValue);

					if(fraction < 1) {	// If process is ongoing, set to new value
						anim.object[process.prop][key] = currentValue;
					}
					else {	// If process has ended, explicitly set to target value (to avoid rounding errors)
						anim.object[process.prop][key] = process.val[key];
					}
				});

				// Now check whether the process, animation or all animations have finished, and if so drop them from consideration

				if(fraction < 1) {	// If process is ongoing, set to new value
					//console.log("incremented process", (fraction*100).toFixed(2)+"%", anim.object.name, process.prop, process.val);
				}
				else {	// If process has ended, drop the process from the animation
					anim.processes.splice(processIndex, 1);
					//console.log("removed process", anim.object.name, process.prop, process.val, anim.processes);

					if(!anim.processes.length) {	// If no more processes in the animation, drop the animation altogether
						self.animations.splice(animIndex,1);
						//console.log("removed anim", anim.object.name, self.animations);

						if(!self.animations.length) {
							//console.log('finished all animations - auto-stopping');
							self.stop();
						}
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