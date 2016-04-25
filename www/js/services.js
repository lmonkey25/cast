angular.module('app.services', [])
.service('HttpSvc', function($http, $q, Log){
	this.post = function(url , data){
		var data = Object.keys(data).map(function(key){ 
			  return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); 
			}).join('&');

		var deferred = $q.defer();

		$http({
			url : url,
			method : "POST",
			data : data,
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8'
			}			
            //withCredentials: true        	
		}).success(function(data, status, headers, config){
			Log.out(data);
			deferred.resolve(data);
		}).error(function(data, status, headers, config){
			Log.out(data);
			deferred.reject(data);
		});

		return deferred.promise;
	}

	this.get = function(url){
		var deferred = $q.defer();

		$http({
			url : url,
			method : "GET"			
            //withCredentials: true        	
		}).success(function(data, status, headers, config){
			deferred.resolve(data);
		}).error(function(data, status, headers, config){
			deferred.reject(data);
		});

		return deferred.promise;
	}
})

.factory('API', ["HttpSvc" ,"$q", "Log", function(HttpSvc, $q, Log){
	var ret = {
		login: function(loginData){
			var deferred = $q.defer();

			HttpSvc.post(urls.login, loginData).then(function(ret){	
				console.log(ret);
				Log.out(ret);			
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.user);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		},

		getFolders: function(id, parent, page){
			var deferred = $q.defer();

			var info = {
				id: id,
				parent: parent,
				page: page
			};

			HttpSvc.post(urls.folders, info).then(function(ret){
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.folders);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		},

		getFiles: function(id, parent, page){
			var deferred = $q.defer();

			var info = {
				id: id,
				parent: parent,
				page: page
			};

			HttpSvc.post(urls.files, info).then(function(ret){
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.files);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		},

		getFile: function(id){
			var deferred = $q.defer();

			var info = {
				id: id
			};

			HttpSvc.post(urls.file, info).then(function(ret){
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.file);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		},

		searchFolders: function(id, search){
			var deferred = $q.defer();

			var info = {
				id: id,
				search: search
			};

			HttpSvc.post(urls.searchfolders, info).then(function(ret){
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.folders);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		},

		searchFiles: function(id, search){
			var deferred = $q.defer();

			var info = {
				id: id,
				search: search
			};

			HttpSvc.post(urls.searchfiles, info).then(function(ret){
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.files);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		},

		createfolder: function(id, parent, name){
			var deferred = $q.defer();

			var info = {
				id: id,
				parent: parent,
				name: name
			};
			Log.out(info);
			HttpSvc.post(urls.createfolder, info).then(function(ret){
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.folder);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		},

		createfile: function(id, parent, filename, originalname, type, size){
			var deferred = $q.defer();

			var info = {
				id: id,
				parent: parent,
				filename: filename,
				name: originalname,
				type: type,
				size: size
			};
			Log.out(info);
			HttpSvc.post(urls.createfile, info).then(function(ret){
				if(ret.err){
					deferred.reject(ret.err);
				}else{
					deferred.resolve(ret.file);
				}
			}, function(err){
				deferred.reject(err);
			});

			return deferred.promise;
		}
	};
	return  ret;
}])

.service('Log', function(){
	this.out = function(data){
		console.log(JSON.stringify(data));
	}
})

.service('Alert', function($ionicPopup){
	this.show = function(title, body){
		$ionicPopup.alert({
			title: title,
			template: "<center>" + body + "</center>"
		});
	}
})

.service('DeviceFile', function($cordovaFile, $ionicPlatform, Log){
	this.writeAsJson = function(filename, json, cb){
		$ionicPlatform.ready(function() {
			$cordovaFile.writeFile(cordova.file.dataDirectory, filename, JSON.stringify(json), true).then(function(){
				cb(true);
			}, function(err){
				cb(false);
			});
		});
	},

	this.readAsJson = function(filename, cb){
		$ionicPlatform.ready(function(){
			$cordovaFile.checkFile(cordova.file.dataDirectory, filename).then(function(){
				$cordovaFile.readAsText(cordova.file.dataDirectory, filename).then(function(data){
					Log.out(data);
					cb(true, JSON.parse(data));
				}, function(err){
					cb(false, null);
				});
			}, function(err){
				cb(false, null);
			});
		});
	}

	this.delete = function(filename, cb){
		$ionicPlatform.ready(function(){
			$cordovaFile.removeFile(cordova.file.dataDirectory, filename).then(function(){
				cb(true);
			}, function(err){
				cb(false);
			});
		});
	}
});