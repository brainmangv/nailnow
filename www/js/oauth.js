function Oauth(apiurl){
	this.oauth_client_id="nailnow_app";
	this.apiUrl=apiurl;
	this.oauthUrl=this.apiUrl+'/oauth';
	this.signupUrl =this.apiUrl+'/signup';
	this.signupFBUrl =this.apiUrl+'/signup';
	this.identityUrl =this.apiUrl+'/identity';
	this.checkFacebookidUrl=this.apiUrl+ '/check/facebookid';
	this.checkEmailUrl=this.apiUrl+ '/check/email';
	this.updateUserUrl=this.apiUrl+ '/usuario';
	this.apiurlServico=this.apiUrl+ '/servico';
	var access_token;
	var refresh_token;
}

Oauth.prototype ={
	setToken: function(access_token,expires_in){
		this.access_token = {access_token:access_token};
		this.access_token.expires_in=Math.round(new Date().getTime() / 1000) + expires_in;
		window.localStorage.setItem("access_token",JSON.stringify(this.access_token));
	},
	
	setRefreshToken: function(refresh_token){
		this.refresh_token = refresh_token;
		window.localStorage.setItem("refresh_token",refresh_token);
	},

	requestNewToken: function(){
		var data ={
			grant_type : "refresh_token",
    		refresh_token: this.getRefreshToken(),
    		client_id: this.oauth_client_id
		}
		that=this;
		return this.post(this.oauthUrl,data,false)
			.done(function(response){
				//console.log('requestNewToken',response);
				that.setToken(response.access_token,response.expires_in);
				that.setRefreshToken(response.refresh_token);
			});
	},

	getToken: function(){
		if (!this.access_token){
			this.access_token =JSON.parse(window.localStorage.getItem("access_token"));	
		}
		return this.access_token;
	},

	getRefreshToken: function(){
		if (!this.refresh_token){
			this.refresh_token =window.localStorage.getItem("refresh_token");	
		}
		return this.refresh_token;
	},

	returnToLoginScreen:function(){
		$.afui.popup({
		   title:'Atenção',
		   message:'Sua Seção Expirou. Por favor, faça login novamente.',
		   cancelOnly:true, 
		   cancelText:"OK",
		   cancelCallback: function(){$.afui.loadContent("#main",false,false,"up")},		   
		});
	},

    ajax2: function(url, type , data =null , withtoken = true){
		var that=this;
		var ajaxobj ={
			url: url,
			type: type,
			data: data ? JSON.stringify(data) : null,			
			dataType: 'json',
			contentType :'application/json',
			error: function(response){
				//console.log('ajaxerror',response);
		    	if (response.status==401 && response.statusText=="expired_token") returnToLoginScreen();	
		    }
		}

	    if (withtoken){ 	    		    		
    		ajaxobj.beforeSend = function( xhr ) {	        		        	
        		//console.log('beforeSend-1 ' +that.access_token.access_token);
				xhr.setRequestHeader( "Authorization", "Bearer " + that.access_token.access_token );        		
			}

			if (this.isExpired()){
				//console.log('isExpired');
				that.requestNewToken()
					.then(function(response){
						//console.log('expired.done ' +that.access_token.access_token);
						//xhr.setRequestHeader( "Authorization", "Bearer " + that.access_token.access_token );
						
					}).then(function(){ jQuery.ajax(ajaxobj)});

			}else {return jQuery.ajax(ajaxobj)}				
		}else{
			return jQuery.ajax(ajaxobj);
		}
    },
	
	ajax: function(url, type , data =null , withtoken = true){
    	var that=this;
    	var d = $.Deferred();
    	var ajaxobj ={
			url: url,
			type: type,
			data: data ? JSON.stringify(data) : null,			
			dataType: 'json',
			contentType :'application/json',			
		}
		
		if (withtoken){ 	    		    		
			ajaxobj.beforeSend = function( xhr ) {	        		        	
				xhr.setRequestHeader( "Authorization", "Bearer " + that.access_token.access_token );        		
			}

			if (this.isExpired()){
				//console.log('isExpired');
				that.requestNewToken()
				.done(function(){
					jQuery.ajax(ajaxobj)
						.done(function(response,m,jqxhr){d.resolve(response,m,jqxhr)})
						.fail(function(response){d.reject(response)});											
				}).fail(function(response){
					that.returnToLoginScreen();
					d.reject(response);
				});
				return d.promise();
			}
		}
		return jQuery.ajax(ajaxobj);
	},


	get: function (url, withtoken = true){				
		$.afui.showMask('Processando...');
		$.afui.blockUI(.2);
		return this.ajax(url,'GET',null, withtoken)
		.fail(function(e){console.log(e)})
		.always(function(){
			$.afui.hideMask();
			$.afui.unblockUI();
		})
	},

	post: function (url, data = null, withtoken = true){		
		$.afui.showMask('Processando...');
		$.afui.blockUI(.2);
		return this.ajax(url,'POST',data,withtoken)
		.fail(function(e){console.log(e)})
		.always(function(){
			$.afui.hideMask();
			$.afui.unblockUI();
		})
	},

	patch: function (url, data = null, withtoken = true){		
		$.afui.showMask('Processando...');
		$.afui.blockUI(.2);
		return this.ajax(url,'PATCH',data,withtoken)
		.fail(function(e){console.log(e)})
		.always(function(){
			$.afui.hideMask();
			$.afui.unblockUI();
		})
	},

	signUp: function(user){
		var that=this;		
		return this.post(this.signupUrl,user,false)
		.done(function(data){
			that.setToken(data.token.access_token,data.token.expires_in);
			that.setRefreshToken(data.token.refresh_token);
			//console.log('token',data.token);
		})	
	},

	identity: function(){
		return this.get(this.identityUrl);
	},

	isAuthenticated: function(){
		return (this.getToken()!=null);
	},
	
	login: function(credentials){
		var data ={
		    grant_type: "password",
		    username: credentials.email,
		    password: credentials.password,
		    client_id: "nailnow_app"
		}
		that=this;
		return this.post(this.oauthUrl,data,false)
			.done(function(response){
				//console.log('login',response);
				that.setToken(response.access_token,response.expires_in);
				that.setRefreshToken(response.refresh_token);
			});
	},
	logout: function(){
		this.access_token=null;
		this.refresh_token=null;
		d = $.Deferred();
		d.resolve(true);
		return d.promise();
	},

	isExpired: function(){
		var isExpired = true;
		if (this.getToken()) {
	      isExpired = Math.round(new Date().getTime() / 1000) >= this.getToken().expires_in;	      
	    }
	    return isExpired;
	},

	checkFacebookid: function(facebookid){
		that=this;
		return this.get(this.checkFacebookidUrl +"/"+ facebookid, false)
		.done(function(data){
			that.setToken(data.token.access_token,data.token.expires_in);
			that.setRefreshToken(data.token.refresh_token);
			//console.log('token',data.token);
		})	;
	},

	checkEmail: function(facebookid,email){
		return this.get(this.checkEmailUrl + facebookid +"/"+email, false);
	},

	updateUser: function(id,detail){
		return this.patch(this.updateUserUrl+"/"+id,detail,true);
	},

	getServicos: function(){
		return this.get(this.apiurlServico);
	}
}