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

	build: function(objData, prefabs) {
		if(!(objData instanceof Array)) {
			objData = [objData];
		}
		return objData.map(function(obj) {
			if(obj.prefab && prefabs[obj.prefab]) {
				obj = this.merge(prefabs[obj.prefab], obj);	// Turn obj into the prefab, then merge any fields defined in obj back over the top
			}
			if(obj.children) {
				obj.children = this.build(obj.children, prefabs);
			}
			return obj;
		}.bind(this));
	},

	inflate: function(objData, prefabs) {

		if(!(objData instanceof Array)) {
			objData = [objData];
		}

		var meshes = [];

		objData.forEach(function(obj) {

			var dim = obj.dim instanceof Array ? obj.dim : [];
			var pos = obj.pos instanceof Array ? obj.pos : [0,0,0];
			var rot = obj.rot instanceof Array ? obj.rot : [0,0,0];
			var scale = obj.scale instanceof Array ? obj.scale : [1,1,1];
			var geo = obj.geo || "ManipulableGroup";

			// Now we need to dynamically call THREE[geo] as a constructor, while also passing in a dynamic array of parameters.
			// However the "new" operator and Function.apply() don't play nicely together, so first we need to produce a standaone constructor
			// function with "this" and the parameters already bound to it (for use with the "new" operator).  The fact we need to pass in an
			// arbitrary array of parameters means we even need to call Function.bind() dynamically though - in this case using Function.apply()
			// So then, we end up calling object.bind.apply(this, [this, otherargs...])
			var objType = THREE[geo];
			var constructorArgs = [].concat(objType, dim.slice() || []);
			var objConstructor = objType.bind.apply(objType, constructorArgs);
			var geometry = new objConstructor();

			var materialConfig = { shading: THREE.SmoothShading };
			if(obj.tex) {
				materialConfig.map = new THREE.TextureLoader().load('textures/' + obj.tex);
				if(obj.trepx) {
					materialConfig.map.wrapS = THREE.RepeatWrapping;
				}
				if(obj.trepy) {
					materialConfig.map.wrapT = THREE.RepeatWrapping;
				}
				materialConfig.map.repeat.set(Number(obj.trepx) || 1, Number(obj.trepy) || 1);
			}
			else {
				materialConfig.color = Number(obj.col) || 0xc0c0c0;
			}
			
			var material = new THREE.MeshPhongMaterial(materialConfig);
			var mesh = new THREE.Mesh(geometry, material);

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
			else {
				if(obj.castShadow){
					mesh.castShadow = true;
				}
				if(obj.receiveShadow){
					mesh.receiveShadow = true;
				}
			}

			mesh.position.set(pos[0], pos[1], pos[2]);
			mesh.scale.set(scale[0], scale[1], scale[2]);
			mesh.rotation.set(deg2rad(rot[0]), deg2rad(rot[1]), deg2rad(rot[2]));
			mesh.name = obj.name;

			mesh.selectable = (geo !== "ManipulableGroup" || !!obj.selectable);

			mesh.onActivate = null;
			if(obj.onActivate && obj.onActivate in animations) {
				mesh.onActivate = animations[obj.onActivate];
			}

			if(obj.children) {
				obj.children.forEach(function(child) {
					if(obj.castShadow && typeof child.castShadow === "undefined") {
						child.castShadow = obj.castShadow;
					}
					if(obj.receiveShadow && typeof child.receiveShadow === "undefined") {
						child.receiveShadow = obj.receiveShadow;
					}
				});
						
				var kids = this.inflate(obj.children, prefabs);
				kids.forEach(function(child) {
		    		mesh.add(child);
		    	});
			}

			meshes.push(mesh);
		}.bind(this));

		return meshes;
	},

	merge: function(orig, from) {
		var to = JSON.parse(JSON.stringify(orig));	// Hacky but effective deep-copy of simple objects
		Object.keys(from).forEach(function(key) {
			if(from[key] instanceof Object && to[key] instanceof Object) {	// obj <- obj => merge objects
				to[key] = this.merge(to[key], from[key]);
			}
			else {								// overwrite to with from
				to[key] = JSON.parse(JSON.stringify(from[key]));	
			}
		}.bind(this));

		return to;
	}

};

THREE.ManipulableGroup = function() {
	THREE.BoxGeometry.call( this );
	this.type = 'ManipulableGroup';

};
THREE.ManipulableGroup.prototype = Object.create( THREE.BoxGeometry.prototype );
THREE.ManipulableGroup.prototype.constructor = THREE.ManipulableGroup;