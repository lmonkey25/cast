angular.module('app.controllers', [])
  
.controller('folderCtrl', function($scope, $ionicActionSheet, $state, $ionicPopup, $rootScope, $ionicHistory, $cordovaFileTransfer, $ionicLoading, API, Alert, $stateParams, Log, DeviceFile) {
	angular.extend($scope, {
		val: {
			folderName: '',
			parent: $stateParams.parent,
			grand: 0,
			moreFolder: true,
			moreFile: true		
		},
		exe: {
			showActionSheet: function(){
				console.log("show Action Sheet");
				var hideSheet = $ionicActionSheet.show({
					buttons: [
						{ text: 'Upload Local Video'},
						{ text: 'Create Folder'},				
						{ text: 'Search'},
						{ text: '<span class="logout-btn">Logout</span>'}		
						],
					cssClass: 'CustomActionSheet',					
					buttonClicked: function(index){
						switch(index){
							case 0:
								console.log("upload button clicked");
								window.plugins.mfilechooser.open(['.mp4'], function (url) {
								  $ionicLoading.show({
								  	template: '<ion-spinner icon="android"></ion-spinner>'
								  });
								  console.log(url);		
								  var name = url.split("/");
								  name = name[name.length - 1];
								  name = name.split(".");
								  var ext = name[1];
								  name = name[0];
							      document.addEventListener('deviceready', function () {
								      	var options = {
								            fileKey: "media",
								            chunkedMode: true,
								            mimeType: "video/mp4",								           
								            fileName: name
								        };
								      $cordovaFileTransfer.upload(urls.uploadurl, url, options).then(function(ret){
								      		Log.out("upload response  = " + ret.response);
								      		var ret = JSON.parse(ret.response);
								      		API.createfile($rootScope.user.id, $scope.val.parent, ret.filename, ret.originalname + "." + ext, ret.type, ret.size).then(function(file){
									      		$ionicLoading.hide();
												Log.out("Successfully saved");
									      		Log.out(file);
									      		$rootScope.data.files.push(file);
									      	}, function(err){
									      		Log.out(err);
									      	});
								      }, function(err){
								      	 Log.out(err);
								      }, function(progress){
								      	console.log(progress);
								      });
							  	  });

							    }, function (error) {
							    	console.log(error);
							    });
								break;
							case 1:
								console.log("create folder button clicked");
								$scope.val.folderName = '';
								var popupDlg = $ionicPopup.show({
									template: '<input type="text" ng-model="val.folderName">',
									title: 'Create Folder',
									scope: $scope,
									buttons: [
										{text: 'Cancel'},
										{
											text: 'OK',
											type: 'button-positive',
											onTap: function(e){
												if(!$scope.val.folderName){

													e.preventDefault();
												}else{
													return $scope.val.folderName;
												}
											}
										}
									]
								});
								popupDlg.then(function(name){
									if(!name){
										console.log("cancel button clicked");
									}else{
										console.log("ok button clicked");
										$ionicLoading.show({
										  	template: '<ion-spinner icon="android"></ion-spinner>'
										});
										API.createfolder($rootScope.user.id, $scope.val.parent, name).then(function(folder){
											$ionicLoading.hide();
											$rootScope.data.folders.push(folder);
											Log.out($rootScope.data.folders);								
										}, function(err){
											//Alert.show("Create Folder",err);
											Log.out(err);
										});
										
									}
								});
								break;							
							case 2:								
								console.log("search button clicked");
								$state.go('search');
								break;							
							case 3:								
								console.log("logout button clicked");
								_pre.logout();
								break;
						}
						return true;
					}		
				});
			},

			showDirectory: function(id){
				console.log("edit profile button clicked");								
				$state.go("folder", { parent: id});										
			},

			gotoParent: function(){						
				$state.go("folder", { parent: $scope.val.grand });
			},

			onCast: function(file){
				if(file.target_id != 0){
					API.getFile(file.target_id).then(function(parent){
						ConnectSDK.discoveryManager.pickDevice().success(function (device) {
				          function sendVideo(){
				              device.getMediaPlayer().playMedia("http://149.56.42.179:1337/?name=" + parent.filesystem_name + "&type=video/mp4", "video/mp4");
				          }

				          if(device.isReady()){
				            sendVideo();
				          }else{
				            device.on('ready', sendVideo);
				            device.connect();
				          }
				      });
					}, function(err){
						Log.out(err);
					});			
				}else{
						ConnectSDK.discoveryManager.pickDevice().success(function (device) {
				          function sendVideo(){
				              device.getMediaPlayer().playMedia("http://149.56.42.179:1337/?name=" + file.filesystem_name + "&type=video/mp4", "video/mp4");
				          }

				          if(device.isReady()){
				            sendVideo();
				          }else{
				            device.on('ready', sendVideo);
				            device.connect();
				          }
				      });
				}
					
			},

			filterFolders: function(){
				return function(folder){
					if(folder.pfolder_id == $scope.val.parent){
						return true;
					}else{
						return false;
					}
				}
			},

			filterFiles: function(){
				return function(file){
					if(file.folder_id == $scope.val.parent){
						return true;
					}else{
						return false;
					}
				}
			},

			loadMoreData: function(){
				$rootScope.data.folders[$scope.val.parent].page++;

				API.getFolders($rootScope.user.id, 0, $rootScope.data.folders[$scope.val.parent].page).then(function(folders){
					Log.out(folders);							
					$rootScope.data.folders = $rootScope.data.folders.concat(folders);	
					if(folders.length <= 0){
						$scope.val.moreFolder = false;
					}						
					$scope.$broadcast('scroll.infiniteScrollComplete');					
				}, function(err){
					console.log(err);
				});
				API.getFiles($rootScope.user.id, 0, $rootScope.data.folders[$scope.val.parent].page).then(function(files){
					Log.out(files);							
					$rootScope.data.files = $rootScope.data.files.concat(files);
					if(files.length <= 0){
						$scope.val.moreFile = false;
					}						
					$scope.$broadcast('scroll.infiniteScrollComplete');					
				}, function(err){
					console.log(err);
				});
			}
		}
	});	

	var _pre = {
		init: function(){
			$scope.val.moreFolder = true;
			$scope.val.moreFile = true;
			if($rootScope.data == null){				
				$rootScope.data = {};				
				DeviceFile.readAsJson("resource.data", function(state, resource){
					Log.out(resource);
					if(state == true && resource != null){
						$rootScope.data = {};
						$rootScope.data.folders = resource.folders;
						$rootScope.data.files = resource.files;						
					}else{
						API.getFolders($rootScope.user.id, 0, 0).then(function(folders){
							Log.out(folders);							
							$rootScope.data.folders = folders;	
							if(folders.length < 11){
								$scope.val.moreFolder = false;
							}else{
								$scope.val.moreFolder = true;
							}													
						}, function(err){
							console.log(err);
						});
						API.getFiles($rootScope.user.id, 0, 0).then(function(files){
							Log.out(files);							
							$rootScope.data.files = files;
							if(files.length < 11){
								$scope.val.moreFile = false;
							}else{
								$scope.val.moreFile = true;
							}															
						}, function(err){
							console.log(err);
						});
					}
				});
			}else{				
				for(var i = 0; i< $rootScope.data.folders.length; i++){
					if($rootScope.data.folders[i].id == $stateParams.parent){
						$scope.val.grand = $rootScope.data.folders[i].pfolder_id;
						if($rootScope.data.folders[i].reading == 0){
							$rootScope.data.folders[i].reading = 1;
							API.getFolders($rootScope.user.id, $stateParams.parent, 0).then(function(folders){
								Log.out(folders);							
								$rootScope.data.folders = $rootScope.data.folders.concat(folders);	
								if(folders.length < 11){
									$scope.val.moreFolder = false;
								}else{
									$scope.val.moreFolder = true;
								}											
							}, function(err){
								console.log(err);
							});
							API.getFiles($rootScope.user.id, $stateParams.parent, 0).then(function(files){
								Log.out(files);							
								$rootScope.data.files = $rootScope.data.files.concat(files);
								if(files.length < 11){
									$scope.val.moreFile = false;
								}else{
									$scope.val.moreFile = true;
								}															
							}, function(err){
								console.log(err);
							});
						}
						break;
					}
				}							
			}			
		},

		logout: function(){
			DeviceFile.delete("user.data", function(state){
				DeviceFile.delete("resource.data",  function(state){
					$ionicHistory.nextViewOptions({
					  disableBack: true
					});
					$rootScope.data = null;
					$rootScope.user = null;
					$state.go('login');
				});
			});			
		}
	};

	$scope.$on('$ionicView.enter', function(){
		Log.out("parent value = " + $scope.val.parent);
		_pre.init();
	});
})
   
.controller('loginCtrl', function($scope, $ionicHistory, $state, API, Alert, Log, $rootScope, DeviceFile, $ionicLoading) {
	angular.extend($scope, {
		val: {
			loginData: {
				username: "",
				password: ""
			}
		},

		exe: {
			gotoSignup: function(){
				window.open('https://megashares.com','_system','location=yes'); 
			},
			doLogin: function(){
				$ionicLoading.show({
				  	template: '<ion-spinner icon="android"></ion-spinner>'
				});

				API.login($scope.val.loginData).then(function(user){
					Log.out(user);
					$rootScope.user  = user;					
					$ionicLoading.hide();
					$ionicHistory.nextViewOptions({
					  disableBack: true
					});
					$state.go('folder', { parent: 0});
				}, function(err){
					$ionicLoading.hide();
					Alert.show("Login Failed", err);
				})
			}
		}
	});

	var _pre = {
		init: function(){			
			DeviceFile.readAsJson("user.data", function(state, user){
				if(state == true && user != null){
					Log.out("user.data read success");
					Log.out(user);
					$rootScope.user = user;
					$ionicHistory.nextViewOptions({
					  disableBack: true
					});
					$state.go("folder", { parent : 0});
				}
			});
		}
	};

	$scope.$on('$ionicView.enter', function(){
		_pre.init();
		$scope.val.loginData.username = "";
		$scope.val.loginData.password = "";
	});
})
 
.controller('SearchCtrl', function($scope, $rootScope, $state, Log, API){
	angular.extend($scope, {
		val: {
			searchtext: ""
		},

		exe: {
			gotoMain: function(){
				$state.go("folder", { parent : 0});
			},
			
			showDirectory: function(id){
			    console.log("edit profile button clicked");
				$state.go("folder", { parent: id });										
			},

			onCast: function(path){
				ConnectSDK.discoveryManager.pickDevice().success(function (device) {
		          function sendVideo(){
		              device.getMediaPlayer().playMedia(path, "video/mp4");
		          }

		          if(device.isReady()){
		            sendVideo();
		          }else{
		            device.on('ready', sendVideo);
		            device.connect();
		          }
		      });
			}
		}
	});

	$scope.$on('$ionicView.enter', function(){		
		$scope.val.searchtext = "";
	});
});