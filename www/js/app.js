/*
 * Please see the included README.md file for license terms and conditions.
 */


// This file is a suggested starting place for your code.
// It is completely optional and not required.
// Note the reference that includes it in the index.html file.


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false */


// For improved debugging and maintenance of your app, it is highly
// recommended that you separate your JavaScript from your HTML files.
// Use the addEventListener() method to associate events with DOM elements.

// For example:

// var el ;
// el = document.getElementById("id_myButton") ;
// el.addEventListener("click", myEventHandler, false) ;

/*jshint browser:true */
/*global $ */
//(function()
//{
    "use strict";
    /*
     hook up event handlers 
    */
    var map = null;
    var map_confirmacao = null;
    var oldLatLng = '';
    var myLatLng ='';
    var geocoder;
    var addressLocation =null;
    var tipo_usuario='';
    var user = new User();
    var $oauth = new Oauth('http://192.168.1.5');
    var USER_IMAGE_PATH= 'http://192.168.1.5/images/users/';
    var countdown =  $("#countdown").countdown360({
        radius      : ($(document).width()/2) - 60,
        seconds     : 60,
        strokeWidth : 10,
        strokeStyle : '#E1004C',
        fillStyle   : '#000010',
        fontColor   : '#FFFFFF',
        autostart   : false,
        onComplete  : function () { 
            $.afui.clearHistory();
            $.afui.loadContent("#manicure",false,false,"slide");
            $.afui.setBackButtonVisibility(true);
            show_header('#af-header-2');
            console.log('countdown done') 
        }
    });
    document.addEventListener("app.Ready", register_event_handlers, false);
    document.addEventListener("app.Ready", redirect_if_logged, false);
    document.addEventListener("app.Ready", initMap, false);
    //document.addEventListener("app.Ready", wakelock, false);
    //document.addEventListener("app.Ready", geolocationAutoUpdate, false);
    document.addEventListener("app.Ready", setupPush, false);

    function register_event_handlers(){        
        window.BOOTSTRAP_OK = true;
        
        document.addEventListener("backbutton", function(e){
            console.log('backbutton');
            if($.afui.activeDiv.id=='main'){
                e.preventDefault();
                navigator.app.exitApp();
            }
            else {
                navigator.app.backHistory()
            }
        }, false);

        if (window.cordova){
            switch (window.cordova.platformId){
                case 'browser':
                    facebookConnectPlugin.browserInit('537031369755381','v2.2');  
                    break;
                default:
                    //openFB.init({appId: 537031369755381});
            }
        }
        if( navigator.splashscreen && navigator.splashscreen.hide ) {   // Cordova API detected
            navigator.splashscreen.hide();
        }
        update_drawer();     
        

        //btn-login2
        $("#btn-login2").on("click",function(){
            var validator = $('#frm_login').validate({
                rules: {
                    login_email: {
                        required: true,
                        email: true
                    },
                    login_senha: {
                        required:true,
                        minlength: 8
                    },
                }
            });
            if (validator.form()){
                var email= $("#login_email").val();
                var senha= $("#login_senha").val();
                user.login(email,senha)
                .done(function(){
                    redirect_if_logged();
                });                
            }            
        });

        //btn-registrou. mostra o mapa principal
        $("#btn-registrou").on("click",function(){            
            // Currently only accentColor and backgroundColor is supported.
            // Note: These have no effect on Android.
            var validator = $('#frm_registrar').validate({
                    rules: {
                        reg_nome: {
                            required: true,
                            minlength: 4
                        },
                        reg_email: {
                            required: true,
                            email: true
                        },
                        reg_senha: {
                            required:true,
                            minlength: 8
                        },
                        reg_confirme_senha : {
                            equalTo : "#reg_senha"
                        }
                    }
                });
            var options = {
              accentColor: '#ff0000',
              backgroundColor: '#ffffff',
            };
            if (validator.form()){
                var nome= $("#reg_nome").val();
                var email=$("#reg_email").val();
                var senha=$("#reg_senha").val();
                user.signup(tipo_usuario,nome,email,senha)
                .then(function(){
                    console.log("iniciando digits");
                    hide_logo_header(); 
                    try{
                        window.plugins.digits.authenticate(options,
                          function (oAuthHeaders) {
                            console.log(oAuthHeaders);
                            if (tipo_usuario=='M')                         
                                $.afui.loadContent("#manicure",false,false,"slide")
                            else show_map();    
                          },
                          function(error) {
                            console.warn("[Digits]", "Login failed", error);
                          }
                        );
                    }catch (e){
                        console.log(e);
                    }
                    
                 });            
                
            }
        });
        
        //Editar conta
        $(".sidemenu-header").on("click",function(evt){
            $.afui.drawer.hide("#sidemenu");      
            hide_logo_header();
            $.afui.loadContent("#editar_conta",false,false,"slide");            
            /*remove("left").reverse().end(function(){
                this.classList.remove("active");
            }).run("slide-out");
            */            
        });   

        $('#sidemenu').on('swipeLeft',function(){$.afui.drawer.hide("#sidemenu")});

        //btn_menu
        $("#btn_menu").on("click", function(evt){            
            $.afui.drawer.show('#sidemenu','left','cover')
        }); 
        
        //panel#main
        $(".panel#main").on("panelload",function(){
          hide_header('#af-header-0');
        });

        //btn-registrar-cliente
        $("#btn-registrar-cliente").on("click",function(){
            tipo_usuario='C';
            console.log('btn-rregistrar');
            $.afui.loadContent("#registrar",false,false,"slide");
        });

        //btn-registrar-manicure
        $("#btn-registrar-manicure").on("click",function(){
            tipo_usuario='M';
            $.afui.loadContent("#registrar",false,false,"slide");
        });

        //.panel#login
        $(".panel#login").on("panelload",function(){
            show_header("#af-header-0");
            //var telephoneNumber = cordova.require("cordova/plugin/telephonenumber");
            //var telephoneNumber = new telephoneNumber();          
        });

        //.panel#registrar
        $(".panel#registrar").on("panelload",function(){
            show_header("#af-header-0");
            //var telephoneNumber = cordova.require("cordova/plugin/telephonenumber");
            //var telephoneNumber = new telephoneNumber();
            /*telephoneNumber.get(function(result) {
                console.log("result = " + result);
                    $("reg_telefone").text(result);
                }, function() {
                    console.log("error");
            });
            */
        });

        //editar_conta
        $(".panel#editar_conta").on("panelload",function(){        
        });
        
        //panel#mapa
        $(".panel#mapa").on("panelload",function(){
          show_logo_header();
          //google.maps.event.trigger(map,'resize');
        });

        //panel#confirmação
        $(".panel#confirmacao-agendamento").on("panelbeforeload",function(){
          //hide_logo_header();
          //wakelock();
        });

        $("#btn-pedir").on("click",function(){
            switch ($("#slider").slider("value")){
            case 1:
                console.log('btn-pedir 1');
                load_confirmacao_agora();
            break;
            case 2:
                console.log('btn-pedir 2');
                load_confirmacao_agendamento();                
            break;
        }
        });

        function static_map(latlng,width,height,zoom){
            var google_img="https://maps.googleapis.com/maps/api/staticmap?zoom="+zoom+"&center="+     
            latlng.lat() +","+
            latlng.lng() + '&size='+width+'x'+height+'&key=AIzaSyCw-1K3hDJDFhDnujklziKhIVNbLFdjIfk';
            return google_img;
        }

        function load_confirmacao_agendamento(){
            hide_logo_header();
            $("#static-map-agendamento").attr("src",static_map(myLatLng,$(document).width(),160,18));
            $.afui.loadContent("#confirmacao-agendamento");                        
            $('#conf_data').mobiscroll().date({
                theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default 
                mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
                display: 'bottom', // Specify display mode like: display: 'bottom' or omit setting to use default 
                lang: 'pt-BR',        // Specify language like: lang: 'pl' or omit setting to use default 
                minDate: new Date(2016,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-14-0/datetime#!opt-minDate
                maxDate: new Date(2016,5,30,15,44),
            });

            /*$('#conf_hora').on('click',function(){
                console.log('#conf_hora');
                $.afui.loadContent("#agenda-horarios",false,false,"up-reveal");
            });*/

            /*$('#conf_hora').mobiscroll().time({
                theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default 
                mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
                display: 'bottom', // Specify display mode like: display: 'bottom' or omit setting to use default 
                lang: 'pt-BR'        // Specify language like: lang: 'pl' or omit setting to use default 
            });*/

            console.log(addressLocation);
            var rua=addressLocation.address_components.find(function(p){return p.types[0]==='route'});
            var numero=addressLocation.address_components.find(function(p){return p.types[0]==='street_number'});
            //.long_name.split('-')[0]
            $("#conf_endereco").val(rua ? rua.long_name: '');
            $("#conf_numero").val(numero ? numero.long_name.split('-')[0] :'');
            //$("#conf_cidade").val(addressLocation.address_components.find(function(p){return p.types[0]==='locality'}).long_name);
            //$("#conf_bairro").val(addressLocation.address_components.find(function(p){return p.types.find(function(t){return t==='sublocality_level_1'})}).long_name);
        };

        function load_confirmacao_agora(){
            hide_logo_header();
            $("#static-map-confirmacao").attr("src",static_map(myLatLng,$(document).width(),$(document).height(),map.getZoom()));
            $.afui.loadContent("#confirmacao-agora");                                    
            $('#conf_data').mobiscroll().date({
                theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default 
                mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
                display: 'bottom', // Specify display mode like: display: 'bottom' or omit setting to use default 
                lang: 'pt-BR',        // Specify language like: lang: 'pl' or omit setting to use default 
                minDate: new Date(2016,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-14-0/datetime#!opt-minDate
                maxDate: new Date(2016,5,30,15,44),
            });

            /*$('#conf_hora').on('click',function(){
                console.log('#conf_hora');
                $.afui.loadContent("#agenda-horarios",false,false,"up-reveal");
            });*/

            /*$('#conf_hora').mobiscroll().time({
                theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default 
                mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
                display: 'bottom', // Specify display mode like: display: 'bottom' or omit setting to use default 
                lang: 'pt-BR'        // Specify language like: lang: 'pl' or omit setting to use default 
            });*/

            console.log(addressLocation);
            $("#conf_endereco").val(addressLocation.address_components.find(function(p){return p.types[0]==='route'}).long_name);
            $("#conf_numero").val(addressLocation.address_components.find(function(p){return p.types[0]==='street_number'}).long_name);
            $("#conf_cidade").val(addressLocation.address_components.find(function(p){return p.types[0]==='locality'}).long_name);
            $("#conf_bairro").val(addressLocation.address_components.find(function(p){return p.types.find(function(t){return t==='sublocality_level_1'})}).long_name);
        };

        $("#confirmacao-servico").on('panelbeforeload',function(){
            $oauth.getServicos().done(function(r){                
                $("#lista-servicos").html('');
                r._embedded.servico.
                forEach(function(e,i){ 
                    $("#lista-servicos").append('<div class="grid grid-pad urow vertical-col list-item">'+
                        '<div class="col col3-4">'+
                        '<input type="checkbox" name="srv'+i+'"'+ 
                        'id="srv'+i+'" class="wide-control" value='+e.id+'>'+
                        '<label for="srv'+i+'">'+e.descricao+'</label>'+
                        '</div><div class="col col1-4"><input name="srv_qtd[]" type="number" size="2" value="1" ></div></div>')
                });
            })
        });


        //slider
        $("#slider").slider({
            min: 1,
            max: 2,
            step: 1,
            change:function(event,ui){                
                switch(ui.value){
                    case 1:
                        $("#btn-pedir").text('PEDIR MANICURE AQUI');
                        break;
                    case 2:
                        $("#btn-pedir").text('AGENDAR MANICURE AQUI');
                        break;
                }                
            },

            stop: function( event, ui ) {
                google.maps.event.trigger(map,'resize');
            }
           // change: showValue
        });

        //slider
        $("#slider-manicure").slider({
            min: 1,
            max: 2,
            step: 1,
            change:function(event,ui){
                
                switch(ui.value){
                    case 1:
                        //$(".map-float-box a").text('PEDIR MANICURE AQUI');
                        break;
                    case 2:
                        //$(".map-float-box a").text('AGENDAR MANICURE AQUI');
                        break;
                }

                
            },

            stop: function( event, ui ) {
                google.maps.event.trigger(map,'resize');
            }
           // change: showValue
        });

        //btn-facebook-login
        $("#btn-facebook-login").on("click",function(){
            console.log('facebook login:');
            user.loginFB()
            .done(function(){
                show_map();
            });
        });

        //btn-facebook-registrar
        $("#btn-facebook-registrar").on("click",function(){
            console.log('facebook registrando:');
            user.loginFB(tipo_usuario)
            .done(function(){
                redirect_if_logged()
            });
        });

        $("#conf_pgto").on("click",function(){
            var intObj = {
              template: 3, 
              parent: '#add_cartao' // this option will insert bar HTML into this parent Element 
            };
            var indeterminateProgress = new Mprogress(intObj);
            indeterminateProgress.start();
            $.afui.loadContent("#add_cartao", false, false, 'slide');
        });

        //scan cartao de credito conf_pgto
        $("#btn_digitalizar").on("click",function(){   
          var cardIOResponseFields = [
            "card_type",
            "card_number",
            "expiry_month",
            "expiry_year",
            "cvv"
          ];

          var onCardIOComplete = function(response) {
            console.log("card.io scan complete");
            for (var i = 0, len = cardIOResponseFields.length; i < len; i++) {
              var field = cardIOResponseFields[i];
              console.log(field + ": " + response[field]);
            }
            $("#conf_pgto").val(response['card_type']+' '+response['card_number']);
          };

          var onCardIOCancel = function() {
            console.log("card.io scan cancelled");
          };

          var onCardIOCheck = function (canScan) {
            console.log("card.io canScan? " + canScan);        
            if (!canScan) {
              $("#conf_pgto").text("Manual entry");
            }
            CardIO.scan({
                "expiry": true,
                "cvv": true,
                "zip": true,
                "suppressManual": false,
                "suppressConfirm": false,
                "hideLogo": true
                },
                onCardIOComplete,
                onCardIOCancel
            );
          };

          CardIO.canScan(onCardIOCheck);
        });

        //btn-historico
        $("#btn-historico").on("click",function(){
             hide_logo_header();
             $.afui.drawer.hide('#sidemenu');
             $.afui.loadContent("#historico",false,false,"slide");
        });

        //btn-meios-pgto
        $("#btn-meios-pgto").on("click",function(){
             hide_logo_header();
             $.afui.drawer.hide('#sidemenu');
             $.afui.loadContent("#meios-pgto",false,false,"slide");
        });

        //btn-compartilhar
        $("#btn-compartilhar").on("click",function(){
            $.afui.drawer.hide('#sidemenu');
            /*$(document.body).actionsheet(
                [{
                    text: 'Facebook',
                    cssClasses: 'blue',
                    handler: function () {
                        $.ui.goBack();
                    }
                }, {
                    text: 'Messenger',
                    cssClasses: 'blue',
                    handler: function () {
                        alert("hi");
                    }
                }, {
                    text: 'WhatsApp',
                    cssClasses: '',
                    handler: function () {
                        alert("goodbye");
                    }
                },{
                    text: 'Google+',
                    cssClasses: '',
                    handler: function () {
                        alert("goodbye");
                    }
                }]
              );*/
            window.plugins.socialsharing.share('Ola Mundo');
        });

        //btn-termos-uso
        $(".btn-termos-uso").on("click",function(){
            //hide_logo_header();            
            var openWindow = cordova.InAppBrowser.open('http://nailnow.co/termos.html');
            //$.afui.drawer.hide('#sidemenu');
            //$.afui.loadContent("#termos-uso",false,false,"slide");    
        });

        //btn-sair
        $("#btn-sair").on("click",function(){
            user.logout();
            window.powerManagement.release(function() {
                console.log('Wakelock released');
            }, function() {
                console.log('Failed to release wakelock');
            });
            //alert('saindo');            
            $.afui.loadContent("#main",false,false,"slide");    
            $.afui.drawer.hide("#sidemenu"); 
            window.plugins.digits.logout();
        });

        //btn_manicure_calendar
        $("#btn-manicure-calendar").on("click",function(){
            hide_logo_header_manicure();
            $.afui.loadContent("#manicure-calendar",false,false,"slide");    
            
        });

        //btn_menu_manicure
        $("#btn-menu-manicure").on("click",function(){
            
        });

        $(".panel#manicure").on("panelload",function(){
          show_logo_header_manicure();
        });

        $("#btn-intent").on("click",function(){
            console.log("#btn-intent");
            window.plugins.webintent.startActivity({
                action: window.plugins.webintent.ACTION_VIEW,
                url: 'google.navigation:q=rua+beira+lago+90+,Governador+Valadares&mode=d'},
                function() {},
                function() {alert('Failed to open URL via Android Intent')}
            );
        }); 

        $("#countdown").on("click",function(){
            console.log('cronometro clicado');
        });
               
    } //register_event_handlers

    function redirect_if_logged(){
        if(!$oauth.isExpired() ){
            if(user.getCurrentUser()){                
                switch(user.current.tipo){
                    case 'C':
                        show_map();
                        break;
                    case 'M':
                        $.afui.loadContent("#manicure",false,false,"slide");
                        break;               
                }
            }
        }
    }

    function wakelock(){
        window.powerManagement.dim(function() {
            console.log('Wakelock acquired');
            }, function() {
            console.log('Failed to acquire wakelock');
        });
    }

    function stopWatch(id){
        var idAssistindo = '';
        if(id){
          idAssistindo = id;
        }else if(GLOBAL.watchID){
          idAssistindo = GLOBAL.watchID;
        }
        if(idAssistindo != ''){
          navigator.geolocation.clearWatch(idAssistindo);
        }else{
          console.log("nao esta assistindo a posição");
        }
    }

    function watchPosition(opcs,success,error){
        stopWatch();
        var timeout = (opcs && opcs.timeout && opcs.timeout>0?opcs.timeout:0);
        var accuracy = (opcs && opcs.accuracy && opcs.accuracy>0?opcs.accuracy:0);

        var posOptions = {enableHighAccuracy: (accuracy===false?false:true)};

        if(!GLOBAL.coordenadas && timeout > 0){
          timeout = (timeout>40000?timeout:40000);
        }
        if(timeout && timeout > 0){
          posOptions.timeout = timeout;
        }

        GLOBAL.watchID = navigator.geolocation.watchPosition(
            function(position){       
                var lat  = position.coords.latitude;
                var lng = position.coords.longitude;

                var retOri = {lat:lat,lng:lng};
                  lat = number_format(lat,4)*1;
                  lng = number_format(lng,4)*1;

                var ret = {lat:lat,lng:lng};

                if(GLOBAL.coordenadas && GLOBAL.coordenadas.lat && GLOBAL.coordenadas.lng){
                  if( GLOBAL.coordenadas.lat != lat ||  GLOBAL.coordenadas.lng != lng){
                    GLOBAL.coordenadas = ret;
                    console.log("pegou posição - ",position);
                    success(retOri);
                  }else{
                    //console.log('não alterou a posição');
                  }
                }else{
                  GLOBAL.coordenadas = ret;
                  success(retOri);
                }

            },

            function(err){
                error(err);
            },
            posOptions
        );
    }

    function geolocationAutoUpdate(){
        window.setInterval(function(){
            navigator.geolocation.getCurrentPosition(function(s){console.log(s.coords)},function(e){console.log(e)})
        },10000);     
    }

    function setupPush() {
        console.log('calling push init');
        var push = PushNotification.init({
            "android": {
                "senderID": "499027471276"
            },
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        console.log('after init');

        push.on('registration', function(data) {
            console.log('registration event: ' + data.registrationId);

            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }

            //var parentElement = document.getElementById('registration');
            //var listeningElement = parentElement.querySelector('.waiting');
            //var receivedElement = parentElement.querySelector('.received');

            //listeningElement.setAttribute('style', 'display:none;');
            //receivedElement.setAttribute('style', 'display:block;');
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            console.log('notification event',data);
            navigator.notification.alert(
                data.message,         // message
                null,                 // callback
                data.title,           // title
                'Ok'                  // buttonName
            );
            navigator.notification.beep(1);
       });
    }

    function hide_map_panel(){
        $(".map-float-box").addClass('hide-float-box');
        $("#map-canvas").addClass('full');
    }

    function show_map_panel(){
        $(".map-float-box").removeClass('hide-float-box');
        $("#map-canvas").removeClass('full');        
    }

    function hide_logo_header(){
        $("#logo-header").hide();
        $("#btn_menu").hide();
    }

    function hide_logo_header_manicure(){
        $("#logo-header-manicure").hide();
        $("#btn-menu-manicure").hide();
    }

    function show_logo_header(){
        $("#logo-header").show();
        $("#btn_menu").show();
    }

    function show_logo_header_manicure(){
        $("#logo-header-manicure").show();
        $("#btn-menu-manicure").show();
    }
    
    function show_map(){   
        show_map_panel();
        $.afui.loadContent("#mapa",false,false,"slide");        
        
        //get GPS location
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(success) {
                    if (map !== null){
                        myLatLng = new google.maps.LatLng(success.coords.latitude, success.coords.longitude);
                        var myMarker = new google.maps.Marker({
                            map: map,
                            icon: {url:'images/ic_my_location_1x_24dp.png',anchor:{x:14,y:14}},
                            animation: google.maps.Animation.DROP,
                            position: myLatLng
                        });
                        map.setCenter(myLatLng);
                        map.setZoom(16);
                        show_map_panel();
                        update_address_bar(myLatLng);
                    }
                }, 
                function(error){
                    hide_map_panel();
                    alert('codigo: '    + error.code    + '\n' + 'messagem: ' + error.message + '\n');
                    $.afui.popup({title:'Sua localização não foi Encontrada',
                        message:'Digite seu endereço no campo acima.',
                        cancelOnly:true,
                        cancelText:"OK"
                    });
                }, 
                { timeout: 10000 }
            )
        }
    }    
    
   function writeCookie(name, value) {
      var cookie = [name, '=', JSON.stringify(value), '; path=/;'].join('');
      document.cookie = cookie;
    }

    function readCookie(name) {
     var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
     result && (result = JSON.parse(result[1]));
     return result;
    }

    function add_search_box(map){
        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });     
        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();     
            if (places.length === 0) {
              return;
            }

            // Clear out the old markers.
            markers.forEach(function(marker) {
              marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            
            places.forEach(function(place) {
                var icon = {
                  url: place.icon,
                  size: new google.maps.Size(71, 71),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(17, 34),
                  scaledSize: new google.maps.Size(25, 25)
                };
            
                if (place.geometry.viewport) {
                  // Only geocodes have viewport.
                  bounds.union(place.geometry.viewport);
                } else {
                  bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
            myLatLng = map.getCenter(); 
            update_address_bar(myLatLng);
            console.log(myLatLng.lat()+' '+myLatLng.lng());
            /*  
            if (_llbounds === null) {
                //Create the rectangle in geographical coordinates
                _llbounds = new google.maps.LatLngBounds(new google.maps.LatLng(p.coords.latitude, p.coords.longitude)); //original
            } else {
                //Extends geographical coordinates rectangle to cover current position
                _llbounds.extend(myLatLng);
            }
            //Sets the viewport to contain the given bounds & triggers the "zoom_changed" event
            _map.fitBounds(_llbounds);  
            */
        }); //SearchBox
    }

    function initMap() {
        geocoder= new google.maps.Geocoder();
        myLatLng = new google.maps.LatLng(-18.9064, -41.9666);
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 3,
            center: myLatLng,
            disableDefaultUI: true
        });    
        
        $(document).on('pagechange', function(){
            google.maps.event.trigger(map,'resize');
        });

        add_search_box(map);
        var myMarker = new google.maps.Marker({
            map: map,
            icon: {url:'images/ic_my_location_1x_24dp.png',anchor:{x:14,y:14}},
            animation: google.maps.Animation.DROP,
            //position: mylocation
        });
        
        addYourLocationButton(map,  myMarker); 
        
        google.maps.event.addListener(map, 'dragstart', function() {
        hide_map_panel();       
        });                                
    
        google.maps.event.addListener(map, 'dragend', function() {
          show_map_panel();
          myLatLng = map.getCenter();         
            update_address_bar(myLatLng);
        });
        google.maps.event.addListener(map, 'zoom_changed', function() {
            if (this.getZoom() < 10) {
                // Change max/min zoom here
                this.setZoom(10);
                console.log('Zoom_changed');
            }
        })
    }

    function update_address_bar(latlng){
        myLatLng=latlng;
        geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            $("#pac-input").val(results[0].formatted_address);
            addressLocation=results[0];
            //console.log('addressLocation '+addressLocation.address_components);
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });   
    }

    function addYourLocationButton(map, marker){
      var controlDiv = document.createElement('div');

      var firstChild = document.createElement('button');
      firstChild.style.backgroundColor = '#fff';
      firstChild.style.border = 'none';
      firstChild.style.outline = 'none';
      firstChild.style.width = '28px';
      firstChild.style.height = '28px';
      firstChild.style.borderRadius = '2px';
      firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
      firstChild.style.cursor = 'pointer';
      firstChild.style.marginRight = '10px';
      firstChild.style.padding = '0px';
      firstChild.title = 'Your Location';
      controlDiv.appendChild(firstChild);

      var secondChild = document.createElement('div');
      secondChild.style.margin = '5px';
      secondChild.style.width = '18px';
      secondChild.style.height = '18px';
      secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
      secondChild.style.backgroundSize = '180px 18px';
      secondChild.style.backgroundPosition = '0px 0px';
      secondChild.style.backgroundRepeat = 'no-repeat';
      secondChild.id = 'you_location_img';
      firstChild.appendChild(secondChild);

      google.maps.event.addListener(map, 'dragend', function() {
          $('#you_location_img').css('background-position', '0px 0px');
      });

      firstChild.addEventListener('click', function() {
          var imgX = '0';
          var animationInterval = setInterval(function(){
              if(imgX == '-18') imgX = '0';
              else imgX = '-18';
              $('#you_location_img').css('background-position', imgX+'px 0px');
          }, 500);

          if(navigator.geolocation) {           
              navigator.geolocation.getCurrentPosition(function(position) {
                myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                marker.setPosition(myLatLng);
                map.setCenter(myLatLng);
                clearInterval(animationInterval);
                $('#you_location_img').css('background-position', '-144px 0px');
                update_address_bar(myLatLng);
                        });
          }
          else{
              clearInterval(animationInterval);
              $('#you_location_img').css('background-position', '0px 0px');
          }
      });

      controlDiv.index = 1;
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
    } 

    function update_drawer(){
        if (user.getCurrentUser()){
            if(user.getCurrentUser().imagem) $("#userimg").attr('src',user.getCurrentUser().imagem);

            $("#username").text(user.getCurrentUser().nome);
            $("#useremail").text(user.getCurrentUser().email);
        }
    } 
    function hide_header(id){
       // $(id).transition().run("translateY(-100px)","500ms").keep();
       // $(id).addClass('hide');
    }

    function show_header(id){
       // $(id).transition().run("translateY(0)","500ms").keep();
       // $(id).removeClass('hide');
    }

    function manicure_cronometro(){
        //hide_header("#af-header-2");        
        hide_logo_header_manicure();        
        $.afui.loadContent("#manicure-cronometro",false,false,"up");
        $.afui.setTitle('Atendimento Agora');
        $.afui.setBackButtonVisibility(false);
        countdown.start();
    }      
    
//})();

// The app.Ready event shown above is generated by the init-dev.js file; it
// unifies a variety of common "ready" events. See the init-dev.js file for
// more details. You can use a different event to start your app, instead of
// this event. A few examples are shown in the sample code above. If you are
// using Cordova plugins you need to either use this app.Ready event or the
// standard Crordova deviceready event. Others will either not work or will
// work poorly.

// NOTE: change "dev.LOG" in "init-dev.js" to "true" to enable some console.log
// messages that can help you debug Cordova app initialization issues.
