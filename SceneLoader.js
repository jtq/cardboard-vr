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
	}
};