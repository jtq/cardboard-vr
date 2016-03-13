var sceneLoader = {

	load: function(url, callback) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
		    var DONE = this.DONE || 4;
		    if (this.readyState === DONE){
		    	callback(JSON.parse(this.responseText));
		    }
		};
		request.open('GET', url, true);
		request.send();
	},

	inflate: function(objData) {

		var meshes = [];

		objData.forEach(function(obj) {
			var dim = obj.dim instanceof Array ? obj.dim : [];
			var pos = obj.pos instanceof Array ? obj.pos : [0,0,0];
			var rot = obj.rot instanceof Array ? obj.rot : [0,0,0];
			var geo = obj.geo || "ManipulableGroup";
			var col = Number(obj.col) || 0xc0c0c0;

			// Now we need to dynamically call THREE[geo] as a constructor, while also passing in a dynamic array of parameters.
			// However the "new" operator and Function.apply() don't play nicely together, so first we need to produce a standaone constructor
			// function with "this" and the parameters already bound to it (for use with the "new" operator).  The fact we need to pass in an
			// arbitrary array of parameters means we even need to call Function.bind() dynamically though - in this case using Function.apply()
			// So then, we end up calling object.bind.apply(this, [this, otherargs...])
			var objType = THREE[geo];
			var constructorArgs = [].concat(objType, dim.slice() || []);
			var objConstructor = objType.bind.apply(objType, constructorArgs);
			var geometry = new objConstructor();
			var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color:col }));

			if(geo === "ManipulableGroup") {
				mesh.material.visible = false;

				mesh.material.__opacity = mesh.material.opacity;
				delete mesh.material.opacity;

				function setOpacityRecursive(op) {

					if(op < 1) {
						this.material.transparent = true;
					}
					else {
						this.material.transparent = false;
					}
					this.material.opacity = op;

					this.children.forEach(function(child) {
						setOpacityRecursive.call(child, op);
					});
				};

				Object.defineProperty(mesh.material, "opacity", {
					get: function () {
						//console.log(mesh.name, "get", this.__opacity);
						return this.__opacity;
					},
					set: function (op) {
						this.__opacity = op;
						//console.log(mesh.name, "set", this.__opacity);
						mesh.children.forEach(function(child) {	// Recursively set all child mesh material transparencies, too
							setOpacityRecursive.call(child, op);
						});
					}
				});
			}

			mesh.position.set(pos[0], pos[1], pos[2]);
			mesh.rotation.set(deg2rad(rot[0]), deg2rad(rot[1]), deg2rad(rot[2]));
			mesh.name = obj.name;

			mesh.selectable = (geo !== "ManipulableGroup" || !!obj.selectable);

			mesh.onActivate = null;
			if(obj.onActivate && obj.onActivate in animations) {
				mesh.onActivate = animations[obj.onActivate];
			}

			if(obj.children) {
				var kids = this.inflate(obj.children);
				kids.forEach(function(child) {
		    		mesh.add(child);
		    	});
			}

			meshes.push(mesh);
		}.bind(this));

		return meshes;
	}

};

THREE.ManipulableGroup = function() {
	THREE.BoxGeometry.call( this );
	this.type = 'ManipulableGroup';

};
THREE.ManipulableGroup.prototype = Object.create( THREE.BoxGeometry.prototype );
THREE.ManipulableGroup.prototype.constructor = THREE.ManipulableGroup;