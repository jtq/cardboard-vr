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
			var pos = obj.pos instanceof Array ? obj.pos : [0,0,0];
			var rot = obj.rot instanceof Array ? obj.rot : [0,0,0];
			var geo = obj.geo || "Object3D";

			// Now we need to dynamically call THREE[obj.geo] as a constructor, while also passing in a dynamic array of parameters.
			// However the "new" operator and Function.apply() don't play nicely together, so first we need to produce a standaone constructor
			// function with "this" and the parameters already bound to it (for use with the "new" operator).  The fact we need to pass in an
			// arbitrary array of parameters means we even need to call Function.bind() dynamically though - in this case using Function.apply()
			// So then, we end up calling object.bind.apply(this, [this, otherargs...])
			var objType = THREE[obj.geo];
			var constructorArgs = [].concat(objType, obj.dim.slice() || []);
			var objConstructor = objType.bind.apply(objType, constructorArgs);
			var geometry = new objConstructor();

			if(geo !== "Object3D") {
				geometry = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color:Number(obj.col) }));
			}

			if(obj.children) {
				var kids = this.inflate(obj.children);
				kids.forEach(function(child) {
		    		geometry.add(child);
		    	});
			}
			
			geometry.position.set(pos[0], pos[1], pos[2]);
			geometry.rotation.set(deg2rad(rot[0]), deg2rad(rot[1]), deg2rad(rot[2]));
			geometry.name = obj.name;
			meshes.push(geometry);
		}.bind(this));

		return meshes;
	}

};