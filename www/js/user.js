function User() {
	/* This contains the currently logged in user */
	this.current=null;
	
	this.signup = function (tipo, nome, email, senha , telefone, facebookid) {
		
		var that=this;
		var d = $.Deferred();
		console.log('user signup',tipo, email, nome, senha);
		var user = {
			tipo: tipo,
			nome: nome,
			email: email,
			senha: senha,
			telefone: telefone,
			facebookid: facebookid
		}
				
		$oauth.signUp(user)
		.then(function(response) {
			that.setCurrentUser()
				.then(function(response){
					that.registerPushNotification0();
					d.resolve(response);		
				})
				.fail(function(response){
					d.reject(response);
				})									
		})
		.fail(function(response) {
			console.log('Error',response);
			var loginErrorText ='Erro de conexão';
			var title="Erro";
			if (response.responseJSON){
				title = response.responseJSON.title;
				if (response.responseJSON.detail.includes('Duplicate entry')){
					loginErrorText = "Email já cadastrado, por favor informe outro.";
				}else{
					loginErrorText =response.responseJSON.detail;
				}			
			}
			$.afui.popup( {
			   title:title,
			   message:loginErrorText,
			   cancelOnly:true, 
			   cancelText:"OK"		   
			 });
			 $.afui.hideMask();
			 $.afui.unblockUI();
			 d.reject(response);
		});		
		
		return d.promise();
	};

	/*
	 Signup user FB
	 */
	this.signupFB = function (type) {
		var d = $.Deferred();
		//Chama metodo de login passando type para entender que vem do cadastro
		this.loginUserFB(type)
		.then(function(response){
			d.resolve(response);
		})
		.fail(function(response){
			d.reject(response);
		})

		return d.promise();
	};

	/*
	Get user data from DB and set localStorage
	*/
	this.setCurrentUser = function(){
		var d = $.Deferred();
		var that=this;
		$oauth.identity()
		.success(function(response){
			that.current= response.usuario;			
			var user_imagem 	= response.usuario.imagem;
			var user_facebookid = response.usuario.facebookid;
			var imagemSrc;
		
			if (user_imagem !== null) {
				imagemSrc = USER_IMAGE_PATH + user_imagem;
			} else if (user_imagem === null && user_facebookid !== null) {
				imagemSrc = "https://graph.facebook.com/" + user_facebookid + "/picture?type=large";
			}
			that.current.imagem=imagemSrc;
			window.localStorage.setItem("currentUser",JSON.stringify(that.current));
			console.log('currentuser',that.current);
			
			d.resolve(response);
		})
		.fail(function(data){
		  d.reject(data);
		})

		return d.promise();
	};

	this.registerPushNotification0 = function(){
		var appVersion;
		var d = $.Deferred();
		var that=this;
		if (typeof cordova !== 'undefined' ){
			cordova.getAppVersion().done(function(v){console.log(v);appVersion=v});
			var push = PushNotification.init({
			    android: {
			        senderID: "499027471276"
			    },
			    ios: {
					senderID: "499027471276",
					"gcmSandbox": "true",
			        alert: "true",
			        badge: "true",
			        sound: "true"
			    },
			    windows: {}
			});

			push.on('registration', function(data) {
				//self.current.deviceToken = data.registrationId;

				var deviceToken = data.registrationId;

				console.log('deviceToken', deviceToken);

				//Grava no db dados atualizados referente ao device
				var deviceInformation = {
					device_token: deviceToken,
					device_manufacturer: device.manufacturer,
					device_model: device.model,
					device_platform: device.platform,
					device_version: device.version,
					device_uuid: device.uuid,
					app_version: appVersion
				}

				console.log('deviceInformation', JSON.stringify(deviceInformation));

				$oauth.updateUser(that.current.id, deviceInformation)
				.then(function(response) {

					d.resolve(response);

				})
				.fail(function(response) {
					console.log(JSON.stringify(response));

					d.resolve();
				});
			});

			push.on('notification', function(data) {
			    console.log('push notificaton',data);
				if (data.additionalData.tipo =='agendamento_agora') {
					order.endereco=data.additionalData.endereco;
					order.cliente_id=data.additionalData.cliente_id;
					order.lat=data.additionalData.lat;
					order.lng=data.additionalData.lng;
					$("#cronometro-endereco").html(order.endereco);					
					if (data.additionalData.foreground)						
						manicure_cronometro()
					else
						toForeground('MainActivity', 'co.nailnow.app', function(){manicure_cronometro()}, null);
						
				}else if (data.additionalData.tipo =='agendamento_agora_aceito') {
					$.afui.hideMask();
					$.afui.unblockUI();
				    $.afui.loadContent('#mapa',false,true);
					$.afui.toast({message:'A manicure aceitou o seu pedido.',position:'tc'});
				}

			    //alert(data);
				// alert($rootScope.badge);
				
				// $rootScope.badge += 1;
				// $rootScope.$apply();

				// $ionicPopup.alert({
				// 	title: 'Notificação',
				// 	content: data.message, 
				// 	buttons: [
				// 		{
				// 			text: '<b>OK</b>',
				// 			type: 'button-positive',
				// 			onTap: function(e) {
				// 				if ($rootScope.$storage.manicury_type == "C"){
				// 					$state.go('customers.notifications');
				// 				} else {
				// 					$state.go('professionals.notifications');
				// 				}
				// 			}
				// 		}
				// 	]
				// });
				
			    // data.title,
			    // data.count,
			    // data.sound,
			    // data.image,
			    // data.additionalData
			});

			push.on('error', function(e) {
				console.log('push.error', e.message);
			});
		}
		return d.promise();
	};

	this.registerPushNotification1 = function(){
		var appVersion;
		var d = $.Deferred();
		var that=this;
		if (typeof cordova !== 'undefined'){
			cordova.getAppVersion().done(function(v){console.log(v);appVersion=v});
			FCMPlugin.getToken(
				function(token){
					var deviceToken = token;
					var deviceInformation = {
						device_token: deviceToken,
						device_manufacturer: device.manufacturer,
						device_model: device.model,
						device_platform: device.platform,
						device_version: device.version,
						device_uuid: device.uuid,
						app_version: appVersion
					}

					if (that.current.tipo=='C') {
						FCMPlugin.subscribeToTopic('cliente');
					}
					else{
						FCMPlugin.subscribeToTopic('manicure');
					}
					
					console.log('deviceInformation', JSON.stringify(deviceInformation));

					$oauth.updateUser(that.current.id, deviceInformation)
					.then(function(response) {

						d.resolve(response);

					})
					.fail(function(response) {
						console.log(JSON.stringify(response));

						d.resolve();
					});
					console.log('deviceToken', deviceToken);
				},
				function(err){
					console.log('error retrieving token: ' + err);
				}
			);

			FCMPlugin.onNotification(
				function(data){
					if(data.wasTapped){
					//Notification was received on device tray and tapped by the user.
						alert( JSON.stringify(data) );
					}else{
					//Notification was received in foreground. Maybe the user needs to be notified.
						alert( JSON.stringify(data) );
					}
				},
				function(msg){
					console.log('onNotification callback successfully registered: ' + msg);
				},
				function(err){
					console.log('Error registering onNotification callback: ' + err);
				}
			);
		}
		return d.promise();
	};

	this.registerPushNotification2 = function(){
		try 
		{ 
			pushNotification = window.plugins.pushNotification;
			if (device.platform == 'android' || device.platform == 'Android' ||
					device.platform == 'amazon-fireos' || device.platform == 'browser') {
					pushNotification.register(function(result){console.log('success:'+ result );}, function(error){console.log('error:'+ error );}, {"senderID":"499027471276","ecb":"onNotification"});		// required!
			} else {
				//pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
			}
		}
		catch(err) 
		{ 
			txt="There was an error on this page.\n\n"; 
			txt+="Error description: " + err.message + "\n\n"; 
			alert(txt); 
		}
	};

	this.getCurrentUser = function(){
		if (!this.current){
			this.current=JSON.parse(window.localStorage.getItem("currentUser"));
		}
		return this.current;
	};
	
	/*
	 Logout the user
	 */
	this.logout = function () {
		var that=this;
		$oauth.logout().then(function() {
			// Remove the authenticated user from local storage
			window.localStorage.clear();
			$.afui.clearHistory();
			
			// Remove the current user info from rootscope
			that.current = null;

			// Facebook logout
			try{
				facebookConnectPlugin.logout(function(e){console.log('FB logout',e)});
			}catch(e){
				console.log('erro no facefacebookConnectPlugin',e);
			}
		});
	};

	/*
	 Login the user
	 */
	this.login= function (email, password) {
		console.log('user login:',email,password);
		var d = $.Deferred();
		var that=this;		
		var credentials = {
			email: email,
			password: password
		}
		$oauth.login(credentials)
		.then(function() {			
			that.setCurrentUser()
			.then(function(response){
				that.registerPushNotification0();
				d.resolve(response);
			})
			.fail(function(response){
				d.reject(response);
			})		
		})
		.fail(function(response) {
			console.log('falha login',response);
			var loginErrorText;
			var loginErrorText ='Erro de conexão';
			var title="Erro";
			if (response.responseJSON){
				if (response.responseJSON.detail.includes('Invalid username and password combination')){
					loginErrorText = "E-mail e/ou Senha inválidos!";
				}else{
					loginErrorText =response.responseJSON.detail;
				}			
			}
			$.afui.popup( {
			   title:title,
			   message:loginErrorText,
			   cancelOnly:true, 
			   cancelText:"OK"		   
			 });
			$.afui.hideMask();
			 d.reject(response);
		});

		return d.promise();
	};

	/*
	 upload the profile image of the users.
	 */
	this.imageUser= function (image, options) {
		var d = $.Deferred();

		//console.log(image);
		//console.log(API_URL + '/users/image/' + $rootScope.$storage.manicury_user);

		$cordovaFileTransfer.upload(API_URL + '/users/image/' + $rootScope.$storage.manicury_user, image, options).then(function(result) {
			//console.log("SUCCESS: " + JSON.stringify(result.response));
			//$scope.showAlert('Done', 'File Uploaded');

			d.resolve(result.response);
		}, function(err) {
			//console.log("ERROR: " + JSON.stringify(err));
			//$scope.showAlert('Error', err);

			d.reject(err);
		}, function (progress) {
			// constant progress updates
			//console.log("PROGRESS: " + JSON.stringify(progress));
		});

		return d.promise();
	};

	/*
	 Login the user FB
	 */
	this.loginFB= function (type){
		var d = $.Deferred();
		var that= this;
		try{
			facebookConnectPlugin.getLoginStatus(function(success) {
				console.log('success.status ', success);

				if(success.status === 'connected'){
					// The user is logged in and has authenticated your app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed request, and the time the access token
					// and signed request each expire
					that.accessToken=success.authResponse.accessToken;
					// If we don't have our user saved
					if(!$oauth.getToken()){
						that.getFacebookProfileInfo(success.authResponse)
						.then(function(userData) {

							//Check user in the DB
							that.checkFacebookUserDB(userData,type,that.accessToken)
							.then(function(response){
								d.resolve(response);
							})
							.fail(function(response){
								d.reject(response);
							})

						}, function(fail){
							// Fail get profile info
							console.log('Profile info fail', fail);
							d.reject(fail);
						});
					}
					else{
						d.resolve();
					}
				}
				else {
					console.log('getLoginStatus2', success);
					facebookConnectPlugin.login(['email', 'public_profile'], function(response){
						console.log('fbLoginSuccess', response);

						if (!response.authResponse){
							console.log('fbLoginSuccess Error', response);
							d.reject(response);
						}
						var authResponse = response.authResponse;
						that.accessToken=response.authResponse.accessToken;
						that.getFacebookProfileInfo(authResponse)
						.then(function(userData) {
							//Check user in the DB
							that.checkFacebookUserDB(userData, type, that.accessToken)
							.then(function(response){
								d.resolve(response);
							})
							.fail(function(response){
								d.reject(response);
							});
						}, function(fail){
							// Fail get profile info
							console.log('profile info fail', fail);
							d.reject(fail);
						});

					}, function(error){ // This is the fail callback from the login method
						console.log('fbLoginError', error);
						d.reject(error);
					});
				}
			});
		}catch(e){
			console.log('>>>facebookConnectPlugin',e.message);			
		}
		return d.promise();
	};

	/*
	 Forgot passaword
	 */
	this.forgotPassword= function (email) {

		var d = $q.defer();

		var data = {
			email: email,
		};

		$http.post(API_URL + '/password/email', data)
			.then(function(response) {

				d.resolve(response);

			})
			.catch(function(response) {
				//console.log(response);
				var loginErrorText = response.data.error;

				$ionicPopup.alert({
					title: 'Erro',
					content: loginErrorText ? loginErrorText : "Erro"
				})

				d.reject(loginErrorText);

			});

		return d.promise();
	};

	/*
	Get Profile Info in the FB API
	*/
	this.getFacebookProfileInfo= function (authResponse) {
		var d = $.Deferred();

		facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, ["email"],
			function (response) {
				console.log('facebook api success: ',JSON.stringify(response));
				d.resolve(response);
			},
			function (response) {
				console.log('facebook api error: ', response);
				d.reject(response);
			}
		);

		return d.promise();
	};

	/*
	Check FB User Data in the DB
	*/
	this.checkFacebookUserDB= function (userData, type, accessToken) {
		var d = $.Deferred();
		var that=this;
		var facebookid = userData.id;
		var facebook_name = userData.name;
		var facebook_email = userData.email;

		console.log('facebookUserDB: ', userData, accessToken);

		//Verifica se o Facebook ID já está cadastrado na base. Se estiver, gera token
		$oauth.checkFacebookid(facebookid, accessToken)
		.done(function(response){
			console.log("response FB: ", response);
			that.setCurrentUser()
			.then(function(response){
				that.registerPushNotification0();
				d.resolve(response);
			})
			.fail(function(response){
				d.reject(response);
			})
		})
		//Se Facebook ID não for encontrado busca por e-mail
		.fail(function(response){
			console.log('error fb id: ',response);

			console.log("Busca se o e-mail existe na base");
			$oauth.checkEmail(facebookid,accessToken)
			.done(function(response){
				console.log('checkFacebookid: ', accessToken);

				$oauth.checkFacebookid(facebookid, accessToken)
				.done(function(response){
					//console.log("response FB get ID: ", response);
					that.setCurrentUser()
					.then(function(response){
						that.registerPushNotification0();
						d.resolve(response);
					})
					.fail(function(response){
						d.reject(response);
					})
				})
				.fail(function(error){
					console.error('Facebook error: ' + error);
					$.afui.popup( {
					   title:error.status,
					   message:error.responseText,
					   cancelOnly:true, 
					   cancelText:"OK"		   
					 });
					d.reject(error);
				})
			})
			.fail(function(response){
				console.log('error user not found: ', response);
				if (typeof response.responseJSON === 'undefined'){
					alert('Erro de conexão');
				}else{
					//Se vier de Cadastro (usuário FB não encontrado na base e tipo informado), insere na base e gera toen
					if(response.responseJSON.detail == "Item not found" && type != null) {
						console.log('cadastrando...');					
						//Cria usuário						
						$oauth.signUp({tipo:type,
							nome:facebook_name,
							email:facebook_email,
							senha:accessToken,
							facebookid:facebookid})
						.then(function(response) {
							that.setCurrentUser()							
							.then(function(response){
								that.registerPushNotification0();
								d.resolve(response);

							})
							.fail(function(response){
								d.reject(response);
							})

						})
						.fail(function(response){
							d.reject(response);
						})					
					}
					else { //Se for de login, retorna erro
						$.afui.popup( {
						   title:'Erro',
						   message:'Usuario não cadastrado',
						   cancelOnly:true, 
						   cancelText:"OK"		   
						 });

						d.reject(response);
					}
				}

			})
		})

		return d.promise();
	};	

	this.updatePosition = function(lat,lng){
    	console.log("Atualizando a posição do Taxista");
        var aux = new GpsSend;
            aux.latitude = lat;
            aux.longitude = lng;
            aux.userid = GLOBAL.userid;
            aux.device = GLOBAL.deviceId;
            aux.platform = ionic.Platform.platform();
            aux.$post({},function(result){

            });
  	}

  	this.addCartao = function(holder_name,card_expiration,card_number,card_cvv,payment_method_code,payment_company_code,vindi_id,id){
  		var data= {
			holder_name: holder_name,
			card_expiration : card_expiration,
			card_number : card_number,
			card_cvv : card_cvv,
			payment_method_code: payment_method_code,
			payment_company_code: payment_company_code,
			vindi_id : vindi_id, 
			id: id
		};
  		return $oauth.addCartao(data);
  	}	
};