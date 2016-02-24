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

		objData.scene.forEach(function(obj) {
			var geometry = new THREE[obj.geo](obj.dim[0],obj.dim[1],obj.dim[2]);
			var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color:Number(obj.col) }));
			mesh.position.set(obj.pos[0], obj.pos[1]-10, obj.pos[2]);
			mesh.rotation.set(deg2rad(obj.rot[0]), deg2rad(obj.rot[1]), deg2rad(obj.rot[2]));
			mesh.name = obj.name;
			meshes.push(mesh);
		});

		return meshes;
	}

};