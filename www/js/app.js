/*jshint browser:true */
/*global $ */
//(function()
//{
    "use strict";
    /*
     hook up event handlers 
    */
    //var map = null;
    var map2 = null;
    //var myLatLng ='';
    //var geocoder;
    //var addressLocation =null;
    var tipo_usuario='';
    var user = new User();
    var order = {};    
    var map_cliente = new Map_cliente();
    var map_manicure = new Map_manicure();
    var popup_pedido_agora;
    var current_agendamento_id;    
    //var myMarker;
    //var myMarker2;
    var $oauth = new Oauth('https://api.nailnow.co');
    var USER_IMAGE_PATH= 'http://api.nailnow.co/images/users/';
    var countdown =  $("#countdown").countdown360({
        radius      : ($(document).width()/2) - 60,
        seconds     : 60,
        strokeWidth : 10,
        strokeStyle : '#E1004C',
        fillStyle   : '#000010',
        fontColor   : '#FFFFFF',
        autostart   : false,
        onComplete  : function () { 
            $.afui.goBack();
            $.afui.setBackButtonVisibility(true);
            show_header('#af-header-2');
            console.log('countdown done') 
        }
    });
    jQuery.validator.addMethod("credit_card", function(value, element) {
       // accept only digits, dashes or spaces
        var respost;
        if (/[^0-9-\s]+/.test(value)) respost = false;

        // The Luhn Algorithm. It's so pretty.
        var nCheck = 0, nDigit = 0, bEven = false;
        value = value.replace(/\D/g, "");

        for (var n = value.length - 1; n >= 0; n--) {
            var cDigit = value.charAt(n),
                  nDigit = parseInt(cDigit, 10);

            if (bEven) {
                if ((nDigit *= 2) > 9) nDigit -= 9;
            }

            nCheck += nDigit;
            bEven = !bEven;
        }
        respost = (nCheck % 10) == 0;

        return this.optional(element) || respost;
    }, "Por favor, forneça um numero válido.");
    document.addEventListener("app.Ready", init, false);
    document.addEventListener("app.Ready", register_event_handlers, false);
    //document.addEventListener("app.Ready", deviceSim, false);
    //document.addEventListener("app.Ready", setupPush, false);

    function init(){           
        
        redirect_if_logged();        
    }

    function register_event_handlers(){
        $.afui.loadDefaultHash=false;        
        window.BOOTSTRAP_OK = true;        
        console.log('appready');
        if (window.cordova){        
            cordova.getAppVersion().done(
                function(v){
                    $("#appversion").html('appVersion:'+v);
                }
            );
        }
        
        //backbutton
        document.addEventListener("backbutton", function(e){
            console.log('backbutton');
            if($.afui.activeDiv.id=='main' || $.afui.activeDiv.id=='manicure'){
                e.preventDefault();
                navigator.app.exitApp();
            }
            else {
                $.afui.goBack();
                //navigator.app.backHistory()
            }
        }, false);

        if (window.cordova){
            switch (window.cordova.platformId){
                case 'browser':
                    facebookConnectPlugin.browserInit('537031369755381','v2.6');  
                    break;
                case 'ios':
                    StatusBar.backgroundColorByHexString("#f8f8f8");
                    break;    
            }
        }

        if( navigator.splashscreen && navigator.splashscreen.hide ) {   // Cordova API detected
            navigator.splashscreen.hide();
        }

        //frm-login
        $("#frm-login,#frm-registrar,#frm-confirmacao-agendamento,#frm-add-cartao").on("keypress",function(k){
            if ( k.keyCode==13 && k.target.dataset.dependency) $(k.target.dataset.dependency).focus();

        });

        
        
        //Editar conta
        $(".userimg").on("click",function(evt){
            function onConfirm(buttonIndex) {
                alert('You selected button ' + buttonIndex);
            }

            navigator.notification.confirm(
                'Voce gostaria de alterar sua imagem ?', // message
                 onConfirm,            // callback to invoke with index of button pressed
                'Game Over',           // title
                ['Restart','Exit']     // buttonLabels
            );
            getImage();
            //$.afui.drawer.hide("#sidemenu");      
            //hide_logo_header();
            //$.afui.loadContent("#editar_conta",false,false,"slide");            
            /*remove("left").reverse().end(function(){
                this.classList.remove("active");
            }).run("slide-out");
            */            
        });  

        function getImage() {
            // Retrieve image file location from specified source
            navigator.camera.getPicture(uploadPhoto, function(message) {
            alert('get picture failed');
            },{
                quality: 50, 
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            }
                );
        } 

        function uploadPhoto(imageURI) {
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/jpeg";
 
            var params = new Object();
            params.value1 = "test";
            params.value2 = "param";
 
            options.params = params;
            options.chunkedMode = false;
 
            var ft = new FileTransfer();
            //ft.upload(imageURI, "http://yourdomain.com/upload.php", win, fail, options);
        }

        function win(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            alert(r.response);
        }
 
        function fail(error) {
            alert("An error has occurred: Code = " + error.code);
        }


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
            console.log('btn-registrar');
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

        "registrar-tipo"
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
        $(".panel#confirmacao-agendamento").on("panelload",function(){
            console.log("panel#confirmacao-agendamento");
            if( update_numero_cartao( $(".cartao-credito p"))) $("#btn-confirmacao-agendamento").prop('disabled', false) 
            else $("#btn-confirmacao-agendamento").prop('disabled', true);
        });

        $("#btn-pedir").on("click",function(){
            order={};
            order.address=map_cliente.addressLocation;
            switch ($("#slider").slider("value")){
            case 1:
                console.log('btn-pedir 1');
                order.tipo="now";
                load_confirmacao_agendamento();
                //load_confirmacao_agora();
            break;
            case 2:
                order.tipo="agendamento";
                console.log('btn-pedir 2');
                load_confirmacao_agendamento();                
            break;
        }
        });      
    
        //slider
        $("#slider").slider({
            min: 1,
            max: 2,
            step: 1,
            change:function(event,ui){                
                switch(ui.value){
                    case 1:
                        $("#btn-pedir span").html('PEDIR MANICURE AQUI <i class="fa fa-chevron-right fa-1x"></i>');
                        break;
                    case 2:
                        $("#btn-pedir span").html('AGENDAR MANICURE AQUI <i class="fa fa-chevron-right fa-1x"></i>');
                        break;
                }                
            },

            stop: function( event, ui ) {
                google.maps.event.trigger(map_cliente.map,'resize');
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
                google.maps.event.trigger(map_cliente.map,'resize');
            }
           // change: showValue
        });

        //btn-facebook-login
        $("#btn-facebook-login").on("click",function(){
            console.log('facebook login:');
            user.loginFB()
            .done(function(){                
                update_drawer();
                map_cliente.show_map();                
            });
        });

        //btn-facebook-registrar
        $("#btn-facebook-registrar").on("click",function(){
            console.log('facebook registrando:');
            user.loginFB(tipo_usuario)
            .done(function(){                
                try{
                    window.plugins.digits.authenticate(
                        {accentColor: '#ff0000',backgroundColor: '#ffffff'},
                        function (oAuthHeaders) {
                            var telefone=oAuthHeaders.phonenumber;
                            $oauth.updateUser(user.current.id,{"telefone": telefone})
                                .done(function(){
                                    console.log('redirect if logged');
                                    redirect_if_logged();
                                });
                        },
                        function(error) {
                            console.warn("[Digits]", "Login failed", error);
                        }
                    );
                }catch (e){
                    console.log(e);
                }                
            })
            .fail(function(e){
                console.log('app.js falha loginfB',e);
            })
        });

        $("#conf_pgto").on("click",function(){           
            $.afui.loadContent("#add-cartao", false, false, 'slide');
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

        //historico
        $("#historico").on("panelload",function(){
            $("#historico").html('<ul class="list agenda"></ul>');
            $oauth.getagendamentoCliente(user.current.id)
                .done(function(r){
                    var mes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                    var diaDaSemana=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sabádo'];                    
                    r._embedded.agendamento.forEach(function(i){
                        var d=new Date(i.data_hora);                      
                        $("#historico ul.list").append('<li>'+
                            '<a data-id="'+i.id+'"> <div class="urow">'+
                            '<div class="col col1-4"><img src="'+ (i.manicure_image ? i.manicure_image : 'images/no-user-image.png"') +
                            ' id="userimg"></div>'+
                            '<div class="col col3-4 last">'+
                                '<p>'+i.manicure_nome+'</p>'+
                                    '<p>Agendado - '+ diaDaSemana[d.getDay()]+' ' +d.getDate()+'/'+
                                    mes[d.getMonth()] + ' '+i.data_hora.substr(-5)+'</p>'+
                                    '<p>R$ '+i.total+' <span>'+i.status+'</span> </p>'+
                            '</div></div></a></li>');                    
                    })

                    //list.agenda a
                    $("#historico ul.list.agenda a").on("click",function(){
                        current_agendamento_id = $(this).data("id");
                        $.afui.loadContent("#historico-detail");
                    });
                    
                })
                .fail(function(e){
                    $("#historico").html('<div class="grid grid-pad urow uib_row_10 row-height-10" data-uib="layout/row" data-ver="0">'+
                        '<div class="col uib_col_17 col-0_12-12" data-uib="layout/col" data-ver="0">'+
                        '<div class="vcenter-historico">Histórico Vazio.<br>Seus atendimentos serão listados aqui.</div>'+
                        '</div>'+
                    '</div>');
                })
        });

        //historico-detail panelbeforeload
        $("#historico-detail").on("panelbeforeload",function(){
            console.log('historico-detail detail');            
        	$("#historico-detail").html('');
            $oauth.getagendamentoId(current_agendamento_id)
                .done(function(r){                 
                    var d=new Date(r.data_hora);
                    var mes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                    var diaDaSemana=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sabádo'];  
                  var html='<p class="formGroupHead grid-pad">Detalhes do Pedido</p>'+
                    '<ul class="list inset">'+
                    '<li class="urow vertical-col">'+
                        '<div class="col"><p class="border-bottom">'+r.manicure_nome+'</p></div>'+
                        '<div class="col col2"><p class=" border-bottom">'+ diaDaSemana[d.getDay()]+' ' +d.getDate()+'/'+
                                    mes[d.getMonth()] +'</p></div>'+
                        '<div class="col col2 last"><p class=" border-bottom">'+r.data_hora.substr(-8,5)+'</p></div>'+
                        '<div class="col col3-4"><p class="border-bottom">'+r.endereco+'</p></div>'+
                        '<div class="col col1-4 last"><p class="border-bottom">'+r.numero+'</p></div>'+
                        '<div class="col col3-4"><p class="border-bottom">'+r.cidade+'</p></div>'+
                        '<div class="col col1-4 last"><p class="border-bottom">'+r.uf+'</p></div>'+
                        '<div class="col"><p class="border-bottom icon phone"><a href="tel:'+r.telefone+'" >'+r.telefone+'</a></p></div>'+
                    '</li>'+
                    '</ul>'+
                    '<p class="grid-pad formGroupHead">Servicos</p>'+
                    '<ul class="list inset">'+
                        '<li class="urow">'+
                            '<div class="list-header urow">'+
                                '<div class="col col3-4"><p>&nbsp; Item</p></div>'+
                                '<div class="col col1-4 vertical-col center"><p>QTD</p></div>'+
                            '</div>';
                            var servicos= r.servicos ? JSON.parse(r.servicos): null;
                            if (servicos) servicos.forEach(function(s){
                                html+='<div class="col col3-4 "><p class="border-bottom">'+s.descricao+'</p></div>'+
                            '<div class="col col1-4 last vertical-col center"><p class="border-bottom">'+s.qtd+'</p></div>';
                            });
                        html+='</li></ul>';
                  $("#historico-detail").html(html);
                });		
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
              if (window.plugins && window.plugins.socialsharing)
                window.plugins.socialsharing.share('Veja esse novo app para agendamentos de manicure.');
        });

        //btn-termos-uso
        $(".btn-termos-uso").on("click",function(){
            //hide_logo_header();            
            if (window.cordova){
                var openWindow = cordova.InAppBrowser.open('http://nailnow.co/termos.html');
            }
            //$.afui.drawer.hide('#sidemenu');
            //$.afui.loadContent("#termos-uso",false,false,"slide");    
        });

        //btn-sair
        $(".btn-sair").on("click",function(){
            if (user.current.tipo=='C'){
                map_cliente.stopWatchManicure();
                map_cliente.stopWatch();
            } else{
                map_manicure.stopWatch();
            }            
            user.logout();            
            if (window.plugins && window.plugins.digits)
                window.plugins.digits.logout();
            $.afui.loadContent("#main",false,false,"slide");    
            $.afui.drawer.hide("#sidemenu");            
        });

        //btn_manicure-calendar
        $("#btn-manicure-calendar").on("click",function(){
            hide_logo_header_manicure();
            $.afui.loadContent("#manicure-calendar",false,true,"up");
        });

        //btn_manicure-home
        $("#btn-manicure-home").on("click",function(){
            //hide_logo_header_manicure();
            $.afui.loadContent("#manicure",false,true,"up");
        });
      
        //btn_manicure-conta
        $("#btn-manicure-conta").on("click",function(){
            //hide_logo_header_manicure();
            $.afui.loadContent("#manicure-menu",false,true,"up");
        });

        //manicure_calendar panelload
        $("#manicure-calendar").on("panelbeforeload",function(){
            $("#manicure-calendar").html('<ul class="list agenda"></ul>');
            $oauth.getagendamentoManicure(user.current.id)
                .done(function(r){
                    var mes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                    var diaDaSemana=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sabádo'];                    
                    r._embedded.agendamento.forEach(function(i){
                        var d=new Date(i.data_hora);                      
                        $("#manicure-calendar ul.list").append('<li>'+
                            '<a data-id="'+i.id+'"> <div class="urow">'+
                            '<div class="col col1-4"><img src='+ (i.cliente_image ? i.cliente_image : '"images/no-user-image.png"') +' id="userimg"></div>'+
                            '<div class="col col3-4 last">'+
                                '<p>'+i.cliente_nome+'</p>'+
                                    '<p>'+ diaDaSemana[d.getDay()]+' ' +d.getDate()+'/'+
                                    mes[d.getMonth()] + ' '+i.data_hora.substr(-8,5)+'</p>'+
                                    '<p>R$ '+i.total+' <span>'+i.status+'</span> </p>'+
                            '</div></div></a></li>');                    
                    })
                    
                    //list.agenda a
                    $("ul.list.agenda a").on("click",function(){
                        current_agendamento_id = $(this).data("id");
                        $.afui.loadContent("#manicure-calendar-detail");
                    });
                    
                })
                .fail(function(e){
                    $("#historico").html('<div class="grid grid-pad urow uib_row_10 row-height-10" data-uib="layout/row" data-ver="0">'+
                        '<div class="col uib_col_17 col-0_12-12" data-uib="layout/col" data-ver="0">'+
                        '<div class="vcenter-historico">Histórico Vazio.<br>Seus atendimentos serão listados aqui.</div>'+
                        '</div>'+
                    '</div>');
                })
        });

        //manicure-calendar-detail panelbeforeload
        $("#manicure-calendar-detail").on("panelbeforeload",function(){
            console.log('manicure calendar detail');            
        	$("#manicure-calendar-detail").html('');
            $oauth.getagendamentoId(current_agendamento_id)
                .done(function(r){                 
                    var d=new Date(r.data_hora);
                    var mes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                    var diaDaSemana=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sabádo'];  
                    var html='<p class="formGroupHead grid-pad">Detalhes do Pedido</p>'+
                    '<ul class="list inset">'+
                    '<li class="urow vertical-col">'+
                        '<div class="col"><p class="border-bottom">'+r.cliente_nome+'</p></div>'+
                        '<div class="col col2"><p class=" border-bottom">'+ diaDaSemana[d.getDay()]+' ' +d.getDate()+'/'+
                                    mes[d.getMonth()] +'</p></div>'+
                        '<div class="col col2 last"><p class=" border-bottom">'+r.data_hora.substr(-8,5)+'</p></div>'+
                        '<div class="col col3-4"><p class="border-bottom">'+r.endereco+'</p></div>'+
                        '<div class="col col1-4 last"><p class="border-bottom">'+r.numero+'</p></div>'+
                        '<div class="col col3-4"><p class="border-bottom">'+r.cidade+'</p></div>'+
                        '<div class="col col1-4 last"><p class="border-bottom">'+r.uf+'</p></div>'+
                        '<div class="col"><p class="border-bottom icon phone"><a href="tel:'+r.telefone+'" >'+r.telefone+'</a></p></div>'+
                        '<div class="col"><p class="border-bottom icon location"><i class="fa fa-map" aria-hidden="true"></i>'+
                        '<a href="#" onclick=window.open("google.navigation:q='+encodeURI(r.endereco+' '+r.numero+' - '+r.cidade+' - '+r.uf+'&mode=d')+
                         '","_system");>Navegar no Google Maps</a></p></div>'+ 
                    '</li>'+
                    '</ul>'+
                    '<p class="grid-pad formGroupHead">Servicos</p>'+
                    '<ul class="list inset">'+
                        '<li class="urow">'+
                            '<div class="list-header urow">'+
                                '<div class="col col3-4"><p>&nbsp; Item</p></div>'+
                                '<div class="col col1-4 vertical-col center"><p>QTD</p></div>'+
                            '</div>';
                             var servicos= r.servicos ? JSON.parse(r.servicos): null;
                             if (servicos) servicos.forEach(function(s){
                                html+='<div class="col col3-4 "><p class="border-bottom">'+s.descricao+'</p></div>'+
                                '<div class="col col1-4 last vertical-col center"><p class="border-bottom">'+s.qtd+'</p></div>';
                            });
                    html+='</li></ul>';
                   $("#manicure-calendar-detail").html(html);
                });		
        });

        //btn_menu_manicure
        $("#btn-menu-manicure").on("click",function(){
            
        });

        //.panel#manicure
        $(".panel#manicure").on("panelload",function(){
          //if (cordova.plugins.backgroundMode)
          show_logo_header_manicure();
        });
        
        //btn-intent
        $("#btn-intent").on("click",function(){
            console.log("#btn-intent");
            window.plugins.webintent.startActivity({
                action: window.plugins.webintent.ACTION_VIEW,
                url: 'google.navigation:q=rua+beira+lago+90+,Governador+Valadares&mode=d'},
                function() {},
                function() {alert('Failed to open URL via Android Intent')}
            );
        }); 

        //countdown
        $("#countdown").on("click",function(){
            console.log('cronometro clicado');
        });
       
        //btn-confirmacao-agendamento
        $("#btn-confirmacao-agendamento").on("click",function(){            
            
            if($("#frm-confirmacao-agendamento").valid()){ 
                order.endereco = $("#conf_endereco").val();
                order.numero =$("#conf_numero").val();
                order.bairro = $("#conf_bairro").val();
                order.cidade= $("#conf_cidade").val();
                order.uf= $("#conf_uf").val();
                order.cep= $("#conf_cep").val();
                order.telefone= $("#conf_telefone").val();
                order.cliente_id= user.current.id;
                order.vindi_id=user.current.vindi_id;
                $.afui.loadContent("#confirmacao-servicos",false,false,"slide");
            } 
        });       
        
        //confirmacao-servicos
        $("#confirmacao-servicos").on('panelbeforeload',function(){
            $("#lista-servicos").html('');
            $oauth.getServicos().done(function(servicos){                
                servicos.
                forEach(function(e,i){ 
                    $("#lista-servicos").append('<div class="grid grid-pad urow vertical-col list-item">'+
                        '<div class="col col3-4">'+
                        '<input type="checkbox" name="srv'+i+'"'+ 
                        'id="srv'+i+'" data-row="'+i+'" class="wide-control" value='+e.id+
                        ' data-valor="'+e.preco+'" data-duracao="'+e.duracao+'" >'+
                        '<label for="srv'+i+'">'+e.descricao+'</label>'+
                        '</div><div class="col col1-4"><input id="srv_qtd_'+i+
                        '" type="number" size="2" value="1" ></div></div>')
                });

                $("#lista-servicos input[type=checkbox]").on("click",function(){
                    console.log("checked");
                    if($('#lista-servicos input[type=checkbox]:checked').size()){
                        $("#btn-confirmacao-servicos").prop('disabled', false)
                        }else{
                            $("#btn-confirmacao-servicos").prop('disabled', true)
                        }
                });
            })
        });

        //btn-confirmacao-servicos
        $("#btn-confirmacao-servicos").on("click",function(){
            order.servicos =[];
            order.duracao=0;
            $('#lista-servicos input[type=checkbox]:checked').each(
                function(id) {
                    order.servicos.push({
                        "id":$(this).val(),
                        "qtd":$('#srv_qtd_'+$(this).attr('data-row')).val(),
                        "valor":$(this).attr('data-valor'),
                        "duracao":$(this).attr('data-duracao'),
                        "descricao":$("label[for='"+$(this).attr("id")+"']").html()
                    });
                    order.duracao+=($(this).attr('data-duracao')*$('#srv_qtd_'+$(this).attr('data-row')).val());
                    //console.log(e, $('#srv_qtd_'+$(i).attr('data-row')).val()) 
                }
            );
            $.afui.loadContent("#confirmacao-manicures",false,false,"slide");
        }); 

        //confirmacao-manicures
        $("#confirmacao-manicures").on('panelbeforeload',function(){
            $("#lista-manicures").html('');
            $oauth.getManicures(order.tipo).done(function(r){
                if (r.manicures.length>0){
                    r.manicures.
                    forEach(function(e,i){
                        var imgSrc=e.imagem? e.imagem:'images/girl-avatar.png';
                        var pontuacao=e.pontuacao/5*100;
                        $("#lista-manicures").append(
                        '<li class="grid">'+
                            '<a class="btn-lista-manicures" data-id='+e.id+'>'+
                            '<img src="'+imgSrc+'">'+
                            '<div class="nome" >'+e.nome+'</div>'+
                            '<div class="star-ratings">'+
                                '<div class="star-ratings-sprite" style="">'+
                                    '<span style="width:'+pontuacao+'%" class="star-ratings-sprite-rating"></span>'+
                                '</div>'+
                                '<p>'+e.num_avaliacoes+' avaliacoes</p>'+
                            '</div>'+
                            '</a>'+
                        '</li>');
                    });
                }else{
                    $("#lista-manicures").html('<div class="vcenter-historico"><p>Não há profissionais online no momento.</p></div>');                    
                }

                $(".btn-lista-manicures").on("click",function(e){                    
                    order.manicure_id =e.currentTarget.dataset.id;
                    console.log(order);
                    if (order.tipo=="now"){
                        order.data_hora= new Date();            
                        order.data_hora_fim=order.data_hora_fim=new Date(order.data_hora.getTime() + (order.duracao*60000));
                        $.afui.loadContent("#confirmacao-resumo",false,false,"slide");
                    }else $.afui.loadContent("#confirmacao-data-hora",false,false,"slide");                                    
                });     
             });
        });        

        //btn-data
        $("#btn-data").on("click",function(){
            $.afui.loadContent("#selecionar-data",false,false,"cover"); 
        });

        //btn-hora
        $("#btn-hora").on("click",function(){
            if (!order.data_hora){
                $.afui.popup('Selecione uma data primeiro.');
                return;
            }
            $.afui.loadContent("#selecionar-hora",false,false,"cover"); 
        });

        //selecionar-data
        $("#selecionar-data").on("panelbeforeload",function(){
           console.log("selecionar-data");
            $("#selecionar-data ul").html('');
            var diaDaSemana=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sabádo'];
            var d = new Date();
            for (var i=0;i<15;i++){
                var f= new Date();
                f.setDate(d.getDate()+i); 
                $("#selecionar-data ul").append('<li><a data-data="'+f+'">'+f.toLocaleDateString('pt-BR')+' - '+diaDaSemana[f.getDay()]+'</a></li>');
            }

            $("#selecionar-data li a").on("click",function(e){            
                var data =new Date(e.target.dataset.data);
                var diaDaSemana=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sabádo'];
                order.data_hora=data;
                $("#btn-data").html('<i class="fa fa-calendar" aria-hidden="true"></i>&nbsp; '+data.toLocaleDateString('pt-BR')+' - '+diaDaSemana[data.getDay()]);
                console.log('a',e.target.dataset.data);
                $.afui.goBack();
            });
            
        });

        function padzero(num,size){
            return ('00000'+num).slice(size*-1);
        };

        //selecionar-hora
        $("#selecionar-hora").on("panelbeforeload",function(){
            $("#selecionar-hora").html('<ul class="list inset"></ul>');
            var dia=order.data_hora.getFullYear()+'-'+padzero(order.data_hora.getMonth()+1,2)+"-"+padzero(order.data_hora.getDate(),2);
            $oauth.getagendamentoHoras(dia,order.manicure_id).done(function(response){
                var agenda=response._embedded.agendamento;
                console.log('agenda',agenda);
                var time = order.data_hora;
                var hoje = new Date();
                //se o pedido for hoje começa no horario atual
                if (order.data_hora.getDay() == hoje.getDay()){                  
                    time.setHours(time.getHours()+1);
                    time.setSeconds(0);
                    if (time.getMinutes()>30){
                        time.setMinutes(30)
                    }else{
                        time.setMinutes(0);
                    }                
                //começa as 8:00    
                }else{
                    time.setHours(8);
                    time.setSeconds(0);
                    time.setMinutes(0);
                }
                
                if (time.getHours()>17){
                    $("#selecionar-hora").html('<div class="vcenter-historico"><p>Não existe horário disponivel para essa data.</p></div>');
                }

                while(time.getHours()<=17){
                    if (permiteAgendar(time,agenda))
                        $("#selecionar-hora ul").append('<li><a data-hora="'+time.toLocaleTimeString('pt-BR')+'">'+time.toLocaleTimeString('pt-BR').substring(0,5)+'</a></li>');
                    time=new Date(time.getTime() + 30*60000);    
                }

                $("#selecionar-hora li a").on("click",function(e){
                    var hora=e.target.dataset.hora;
                    order.data_hora.setHours(hora.substring(0,2));
                    order.data_hora.setMinutes(hora.substring(3,5));
                    order.data_hora.setSeconds(hora.substring(6,8));                
                    console.log(hora);
                    $("#btn-hora").html('<i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp; '+hora.substring(0,5));
                    $("#btn-confirmacao-data-hora").prop('disabled', false);
                    $.afui.setBackButtonVisibility(true);
                    $.afui.goBack();
                });  

                function permiteAgendar(time,agenda){
                    var permite=true;
                    agenda.forEach(function(e,i,a){
                        var inicio= new Date(e.data_hora);
                        var fim  = new Date(e.data_hora_fim);                        
                        if (time >=inicio && time< fim){
                            //console.log('nao',time,e);
                            permite=false;
                        }
                    });
                    return permite;
                }
            });

               
        });

        //btn-confirmacao-data-hora
        $("#btn-confirmacao-data-hora").on("click",function(){
            order.data_hora_fim=new Date(order.data_hora.getTime() + (order.duracao*60000));
            $.afui.loadContent("#confirmacao-resumo");
        });
        
        //confirmacao-resumo
        $("#confirmacao-resumo").on("panelbeforeload",function(){
            $("#resumo-endereco").html(order.address.formatted_address);
            $("#resumo-data").html(order.data_hora.toLocaleDateString('pt-BR'));
            $("#resumo-hora").html(order.data_hora.getHours()+':'+('00'+(+order.data_hora.getMinutes())).slice(-2)
            );
            
            $("#resumo-cartao").html("Cartão "+user.current.cartao_tipo+" **** **** **** "+user.current.cartao_final);    
            $("#resumo-servicos").html('');
            var total =0;
            order.servicos.forEach(function(item) {
                total+=(item.valor*item.qtd);
                $('#resumo-servicos').append('<li class="urow">'+	
                        '<div class="col col3-4">'+item.descricao +' x'+item.qtd+'</div>'+
                        '<div class="col col1-4 last">R$ '+item.valor*item.qtd+'</div>'+
                    '</li>');                    
            }, this);
            order.total=total;
            $('#resumo-servicos').append('<li class="urow total">'+
                '<div class="col col3-4">Total</div>'+
                '<div class="col col1-4 last"><span id="resumo-total">R$ '+total+'</span></div>'+
            '</li>');
        });

        //btn-confirmacao-resumo
        $("#btn-confirmacao-resumo").on("click",function(){
            if (order.tipo=="now")
                confirmar_pedido_agora()
            else{
                agendar();
            }
        });
        
        function confirmar_pedido_agora(){
            var endereco=order.endereco+' , '+order.numero+' '+order.bairro+' , '+order.cidade;
            var indeterminateProgress;
            var data ={
                'to':order.manicure_id,
                'data':{
                    'title':'Pedido de Agendamento Agora',
                    'cliente_id': order.cliente_id,
                    'tipo':'agendamento_agora',
                    'endereco': endereco,
                    'lat': order.address.geometry.location.lat(),
                    'lng': order.address.geometry.location.lng(),
                    'content-available' : '1'
                }
            }
            console.log('push',data);
            $oauth.push(data);
            $.afui.showMask('Aguarde, localizando o profissional..');
			$.afui.blockUI(.2);
            /*
            popup_pedido_agora=$.afui.popup( {
                title:"Solicitando",
                message:"Aguarde, tentando contatar a profissional",
                cancelText:"Cancelar",
                cancelCallback: function(){},
                
                cancelOnly:true
            });
            $('.afPopup div').first().append('<img src="images/loading.gif" width=60>')
            */
            
        }

        function agendar(){
            var data=order;
            delete data.address;
            delete data.duracao;
            //data.data_hora= order.data_hora.toLocaleDateString();
            $oauth.agendar(data)
            .done(function(r){
                console.log('resposta',r);
                $.afui.popup( {
                        title:"Sucesso",
                        message:"Seu agendamento foi confirmado, breve a profissional entrará em contato com você.",
                        cancelText:"Ok",
                        cancelCallback: function(){$.afui.clearHistory();$.afui.loadContent("#mapa",false,false,"slide"); },
                        cancelOnly:true
                    });
                
            })
            .fail(function(e){
                var message =typeof e.response.JSON !== 'undefined' ? e.response.JSON.detail : 'Erro no processamento';
                $.afui.popup({title:'Falha',message: message,cancelOnly:true,cancelText:'OK'})
            });
        }

        //meios-pgto
        $("#meios-pgto").on("panelbeforeload",function(){
            update_numero_cartao($(".cartao-credito p"));
        });

        //confirmacao-agendamento
        $("#confirmacao-agendamento .cartao-credito p").on("click",function(){
            $.afui.loadContent("#add-cartao",false,false,"slide"); 
        });
             
        //btn-meios-pgto-add
        $("#btn-meios-pgto-add").on("click",function(){
            $.afui.loadContent("#add-cartao",false,false,"slide"); 
        });
        
        //add-cartao
        $("#add-cartao").on("panelbeforeload",function(){
            $("#card_expiration").mask("99/9999");
            $("#holder_name").val('');
            $("#card_number").val('');
            $("#card_expiration").val('');
            $("#card_cvv").val('');            
        });

        $("#btn-add-cartao").on("click",function(){
            var validator = $('#frm-add-cartao').validate({
                rules: {
                    holder_name: {
                        required: true,
                    },
                    card_number: {
                        credit_card: true,
                        required:true,
                        minlength: 12
                    },
                    card_expiration: {
                        required:true,
                        minlength: 5
                    },
                    card_cvv: {
                        required:true,
                        minlength: 3,
                        maxlength: 3 
                    },
                }
            });
            if (validator.form()){
                var holder_name = $("#holder_name").val();
                var card_expiration = $("#card_expiration").val();
                var card_number = $("#card_number").val();
                var card_cvv = $("#card_cvv").val();
                var payment_method_code = 'credit_card';
                var payment_company_code = bandeira_cartao(card_number);

                user.addCartao(holder_name,card_expiration,card_number,card_cvv,payment_method_code,payment_company_code,user.current.vindi_id,user.current.id)
                .done(function(r){
                    user.setCurrentUser().done(function(){
                        //user.current.cartao_tipo= r.payment_profile.payment_company.code;
                        //user.current.cartao_final= r.payment_profile.card_number_last_four;                    
                        
                        update_numero_cartao($(".cartao-credito p"));                    
                        $.afui.popup({title:'Sucesso',message:'cartão adicionado com sucesso',cancelOnly:true,cancelText:'OK'})
                    });
                })
                .fail(function(e){
                    $.afui.popup({title:'Erro de Validação',message:'Erro ao cadastrar o cartão, verifique os dados informados',cancelOnly:true,cancelText:'OK'})
                });                
            } 
        });

        //on panelload
        $(".panel").on('panelload',function(){
            activeBackButton();
        })

        //btn-ficar-online    
        $("#btn-ficar-online").on('click',function(){
            btn_loading();                

            function btn_loading(){
                $("#btn-ficar-online").animation().run('btn-loading').keep().end(function(){
                    $("#btn-ficar-online").addClass('btn-loading-bg');
                    if ($('#btn-ficar-online').hasClass('btn-pink')){
                        ficar_online();    
                    }else{
                        ficar_offline();
                    }
                });
            }

            function btn_loading_reverse(f){
                $("#btn-ficar-online").removeClass('btn-loading-bg');
                $("#btn-ficar-online").animation().run('btn-loading').reverse().end(f);
            }

            function ficar_offline(){                
                $oauth.updateStatus(user.current.id,'offline')
                    .done(function(){
                        map_manicure.online=false;
                        btn_loading_reverse(function(){
                            $("#btn-ficar-online").removeClass('btn-black');
                            $("#btn-ficar-online").addClass('btn-pink');
                            $("#btn-ficar-online").html('FICAR ONLINE');
                            $.afui.toast({message:'Voce esta offline',position:'tc'});
                            if (window.cordova && cordova.plugins.backgroundMode) {
                                cordova.plugins.backgroundMode.disable();
                            }
                            map_manicure.stopProgressBar();
                        });
                    })
                    .fail(function(){

                    }); 
            }

            function ficar_online(){
                $oauth.updateStatus(user.current.id,'online')
                    .done(function(){
                        map_manicure.online=true;
                        btn_loading_reverse(function(){
                            $("#btn-ficar-online").removeClass('btn-pink');
                            $("#btn-ficar-online").addClass('btn-black');
                            $("#btn-ficar-online").html('FICAR OFFLINE');
                            $.afui.toast({message:'Voce esta online',position:'tc'});
                            if (window.cordova && cordova.plugins.backgroundMode) {
                                cordova.plugins.backgroundMode.setDefaults({ text:'Nailnow continua ativo em backgroud'});
                                cordova.plugins.backgroundMode.enable();
                            }
                            map_manicure.startProgressBar();
                        });
                    });
            }
        });
             
        //btn-cronometro-aceitar
        $('#btn-cronometro-aceitar').on('click',function(){
           var data ={
                'to': order.cliente_id,
                'data':{
                    'tipo':'agendamento_agora_aceito',                    
                    'content-available' : '1'
                }
            }
            console.log('agendamento_agora_aceito',data);
            $oauth.push(data);
            countdown.stop();
            $.afui.loadContent("#manicure");
            map_manicure.tracaRota(order.lat,order.lng);
        });
        
        //btn-cronometro-recusar
        $('#btn-cronometro-recusar').on('click',function(){
            var data ={
                'to': order.cliente_id,
                'data':{
                    'tipo':'agendamento_agora_recusado',                    
                    'content-available' : '1'
                }
            }
            $oauth.push(data);
            countdown.stop();
            $.afui.loadContent("#manicure");
        });

        $("#btn-map-route").on("click",function(){
            window.open("google.navigation:q="+order.lat+' '+order.lng+"&mode=d" , '_system');
            //launchnavigator.navigate([order.lat, order.lng], {
            //    start: [map_manicure.myLatLng.lat(),map_manicure.myLatLng.lng()]
            //});
        });
    } //register_event_handlers

    //btn-login2
    function do_frm_login(){
        var validator = $('#frm-login').validate({
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
            })
            .fail(function(e){
                console.log('falha de login',e)
            });                
        }            
        return false;
    };

    //btn-registrou. mostra o mapa principal
    function do_frm_registrar(){
        // Currently only accentColor and backgroundColor is supported.
        // Note: These have no effect on Android.
        var validator = $('#frm-registrar').validate({
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
            console.log("iniciando digits");
            hide_logo_header(); 
            try{
                window.plugins.digits.authenticate(options,
                    function (oAuthHeaders) {
                        var nome =$("#reg_nome").val();
                        var email=$("#reg_email").val();
                        var senha=$("#reg_senha").val();
                        var telefone=oAuthHeaders.phonenumber;
                        console.log('Digits:: ',oAuthHeaders);

                        user.signup(tipo_usuario,nome,email,senha,telefone,null)
                            .then(function(){
                                update_drawer();
                                if (tipo_usuario=='M')                         
                                    $.afui.loadContent("#manicure",false,false,"slide")
                                else {
                                    map_cliente.initMap();
                                    map_cliente.show_map();
                                }                        
                            });
                    },
                    function(error) {
                        console.warn("[Digits]", "Login failed", error);
                    }
                );
            }catch (e){
                console.log(e);
            }                   
        }
        return false;
    };

    function static_map(latlng,width,height,zoom){
        var google_img="https://maps.googleapis.com/maps/api/staticmap?"+ 'size='+width+'x'+height+
        '&markers=icon:https://nailnow.co/img/pin2.png%7C'+latlng.lat() +","+latlng.lng()+
        '&key=AIzaSyCw-1K3hDJDFhDnujklziKhIVNbLFdjIfk';
        return google_img;
    }

    function load_confirmacao_agendamento(){
        var addressLocation=map_cliente.addressLocation;
        hide_logo_header();
        $("#static-map-agendamento").attr("src",static_map(map_cliente.myLatLng,$(document).width(),160,18));
        $.afui.loadContent("#confirmacao-agendamento");                        
        $('#conf_data').mobiscroll().date({
            theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default 
            mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
            display: 'bottom', // Specify display mode like: display: 'bottom' or omit setting to use default 
            lang: 'pt-BR',        // Specify language like: lang: 'pl' or omit setting to use default 
            minDate: new Date(2016,3,10,9,22),  // More info about minDate: http://docs.mobiscroll.com/2-14-0/datetime#!opt-minDate
            maxDate: new Date(2016,5,30,15,44),
        });

        $('#conf_hora').on('click',function(){
            console.log('#conf_hora');
            $.afui.loadContent("#agenda-horarios",false,false,"up-reveal");
        });

        /*$('#conf_hora').mobiscroll().time({
            theme: 'android',     // Specify theme like: theme: 'ios' or omit setting to use default 
            mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
            display: 'bottom', // Specify display mode like: display: 'bottom' or omit setting to use default 
            lang: 'pt-BR'        // Specify language like: lang: 'pl' or omit setting to use default 
        });*/

        console.log(addressLocation);
        var endereco=addressLocation.address_components.find(function(p){return p.types[0]==='route'});
        var numero=addressLocation.address_components.find(function(p){return p.types[0]==='street_number'});
        var bairro=addressLocation.address_components.find(function(p){return p.types.find(function(p){return p=='sublocality'})});
        var cidade=addressLocation.address_components.find(function(p){return p.types.find(function(p){return p=='locality'})});
        var uf=addressLocation.address_components.find(function(p){return p.types[0]==='administrative_area_level_1'});
        var cep=addressLocation.address_components.find(function(p){return p.types[0]==='postal_code'});
        order.endereco = endereco ? endereco.long_name:'';
        order.numero = numero ? numero.long_name.split('-')[0]:'';
        order.bairro = bairro ? bairro.long_name:'';
        order.cidade= cidade ? cidade.long_name:'';
        order.uf= uf ? uf.short_name:'';
        order.cep= cep ? cep.long_name:'';
        order.telefone= user.current.telefone ? user.current.telefone.replace('+55',''):'';
        //.long_name.split('-')[0]
        $("#conf_endereco").val(order.endereco);
        $("#conf_numero").val(order.numero);
        $("#conf_bairro").val(order.bairro);
        $("#conf_cidade").val(order.cidade);
        $("#conf_uf").val(order.uf);
        $("#conf_cep").val(order.cep);
        $("#conf_telefone").val(order.telefone);            
    };

    function load_confirmacao_agora(){
        var addressLocation=map_cliente.addressLocation;
        hide_logo_header();
        $("#static-map-confirmacao").attr("src",static_map(map_cliente.myLatLng,$(document).width(),$(document).height(),map_cliente.map.getZoom()));
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
    
    function activeBackButton(){
        return $('.backButton,[data-back]').on('click',function(){});
    }

    function deviceSim() {
        window.plugins.sim.getSimInfo(function (result) {
            device.sim=result;
            console.log(result);
            }, 
            function (error) {
                console.log(error);
            }
        ); 
    }
    
    function update_numero_cartao(placeholder){
        placeholder.removeClass();
        if (user.current.cartao_tipo){
            placeholder.addClass(user.current.cartao_tipo);
            placeholder.html('CARTÃO FINAL ...'+user.current.cartao_final);
            return true;
        }
        return false;
    }

    function bandeira_cartao(num) {
        var visa= /^4[0-9]{12}(?:[0-9]{3})$/;        
        var mastercard= /^5[1-5][0-9]{14}$/;
        var amex= /^3[47][0-9]{13}$/;
        var dinersclub= /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
        var discovery= /^6(?:011|5[0-9]{2})[0-9]{12}$/;
        var jcb= /^((2131)|(1800)|(35)\d{3})\d{11}$/;
        var elo=/^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})$/;

        if (visa.test(num)) return 'visa';
        if (mastercard.test(num)) return 'mastercard';
        if (amex.test(num)) return 'american_express';
        if (discovery.test(num)) return 'discovery';
        if (dinersclub.test(num)) return 'diners_club';
        if (jcb.test(num)) return 'jcb'; 
        if (elo.test(num)) return 'elo';
    }

    function redirect_if_logged(){
        if(!$oauth.isExpired()){
            if(user.getCurrentUser()){
                user.registerPushNotification0();                
                update_drawer();
                switch(user.current.tipo){
                    case 'C':
                        tipo_usuario='C';                        
                        map_cliente.initMap();
                        map_cliente.show_map();
                        //$.afui.loadContent("#mapa",false,false,"slide");
                        //map_cliente.centerCurrentLocation();
                        break;
                    case 'M':
                        tipo_usuario='M';
                        map_manicure.initMap();                                                
                        $.afui.loadContent("#manicure",false,false,"slide");
                        map_manicure.centerCurrentLocation();
                        break;               
                }
            }
        }else{
           $.afui.loadContent("#main",false,false,"slide");
        }
    }

    function stopWatch(id){
        var idAssistindo = '';
        if(id){
          idAssistindo = id;
        }else if(window.watchID){
          idAssistindo = window.watchID;
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

        if(!window.coordenadas && timeout > 0){
          timeout = (timeout>40000?timeout:40000);
        }
        if(timeout && timeout > 0){
          posOptions.timeout = timeout;
        }

        window.watchID = navigator.geolocation.watchPosition(
            function(position){       
                var lat  = position.coords.latitude;
                var lng = position.coords.longitude;

                var retOri = {lat:lat,lng:lng};
                  //lat = number_format(lat,4)*1;
                  //lng = number_format(lng,4)*1;

                var ret = {lat:lat,lng:lng};

                if(window.coordenadas && window.coordenadas.lat && window.coordenadas.lng){
                  if( window.coordenadas.lat != lat ||  window.coordenadas.lng != lng){
                    window.coordenadas = ret;
                    console.log("pegou posição - ",position);
                    success(retOri);
                  }else{
                    console.log('não alterou a posição');
                  }
                }else{
                  window.coordenadas = ret;
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
        try{
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
        }catch(e){
            console.log(e.message);
        }
    }
    /*
    function hide_map_panel(){
        $(".map-float-box").addClass('hide-float-box');
        $("#map-canvas").addClass('full');
    }

    function show_map_panel(){
        $(".map-float-box").removeClass('hide-float-box');
        $("#map-canvas").removeClass('full');        
    }
     */
    function hide_logo_header(){
        $("#logo-header").hide();
        $("#btn_menu").hide();
    }

    function hide_logo_header_manicure(){
        $("#manicure-header-button").hide();
    }

    function show_logo_header(){
        $("#logo-header").show();
        $("#btn_menu").show();
    }

    function show_logo_header_manicure(){
        $("#manicure-header-button").show();
    }
    /*
    function show_map(){   
        show_map_panel();
        $.afui.loadContent("#mapa",false,false,"slide");        
        
        //get GPS location
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(success) {
                    if (map !== null){
                        myLatLng = new google.maps.LatLng(success.coords.latitude, success.coords.longitude);
                        //myMarker.setPosition(myLatLng);
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
    */   
    
    function writeCookie(name, value) {
        var cookie = [name, '=', JSON.stringify(value), '; path=/;'].join('');
        document.cookie = cookie;
    }

    function readCookie(name) {
     var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
     result && (result = JSON.parse(result[1]));
     return result;
    }

    /*
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
        }); //SearchBox
    }
    */
    /*
    function initMap() {        
        geocoder= new google.maps.Geocoder();
        myLatLng = new google.maps.LatLng(-18.9064, -41.9666);        
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 3,
            center: myLatLng,
            disableDefaultUI: true
        });
        map2 = new google.maps.Map(document.getElementById('map-canvas2'), {
            zoom: 3,
            center: myLatLng,
            disableDefaultUI: true
        });    
        
        $(document).on('pagechange', function(){
            google.maps.event.trigger(map,'resize');
            google.maps.event.trigger(map2,'resize');
        });

        add_search_box(map);
        myMarker = new google.maps.Marker({
            map: map,
            icon: {url:'images/ic_my_location_1x_24dp.png',anchor:{x:14,y:14}},
            //animation: google.maps.Animation.DROP,
            //position: mylocation
        });
        
        myMarker2 = new google.maps.Marker({
            map: map2,
            icon: {url:'images/ic_my_location_1x_24dp.png',anchor:{x:14,y:14}},
            //animation: google.maps.Animation.DROP,
            //position: mylocation
        });
        addYourLocationButton(map,  myMarker);
        addYourLocationButton(map2,  myMarker2); 
        
        google.maps.event.addListener(map, 'dragstart', function() {
        hide_map_panel();       
        });                                
    
        google.maps.event.addListener(map, 'dragend', function() {
          show_map_panel();
          myLatLng = map.getCenter();         
            update_address_bar(myLatLng);
        });

        google.maps.event.addListener(map2, 'dragend', function() {
          myLatLng = map.getCenter();         
        });

        google.maps.event.addListener(map, 'zoom_changed', function() {
            if (this.getZoom() < 10) {
                // Change max/min zoom here
                this.setZoom(10);
                console.log('Zoom_changed');
            }
        })
    }
    */
    /*
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
                console.log('location',myLatLng);
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
    */

    function update_drawer(){
        if (user.getCurrentUser()){
            if(user.getCurrentUser().imagem) $(".userimg").attr('src',user.getCurrentUser().imagem);

            $(".username").text(user.getCurrentUser().nome);
            $(".useremail").text(user.getCurrentUser().email);
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
        //hide_logo_header_manicure();        
        $.afui.loadContent("#manicure-cronometro",false,false,"up");
        $.afui.setTitle('Atendimento Agora');
        $.afui.setBackButtonVisibility(false);
        countdown.start();
    } 

     function onNotification(e) {
       console.log('<li>EVENT -> RECEIVED:',e);
        
        switch( e.event )
        {
            case 'registered':
            if ( e.regid.length > 0 )
            {
                //console.log('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                console.log("regID = " + e.regid);
            }
            break;
            
            case 'message':
                // if this flag is set, this notification happened while we were in the foreground.
                // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                if (e.foreground)
                {
                    alert('<li>--INLINE NOTIFICATION--' + '</li>');
                        
                        // on Android soundname is outside the payload. 
                            // On Amazon FireOS all custom attributes are contained within payload
                            var soundfile = e.soundname || e.payload.sound;
                            // if the notification contains a soundname, play it.
                            // playing a sound also requires the org.apache.cordova.media plugin
                            var my_media = new Audio("/android_asset/www/sound/"+ soundfile);

                    my_media.play();
                }
                else
                {	// otherwise we were launched because the user touched a notification in the notification tray.
                    if (e.coldstart){
                        alert('<li>--COLDSTART NOTIFICATION--' + '</li>');
                        console.log('<li>--COLDSTART NOTIFICATION--' + '</li>');
                    }
                    else{
                        alert('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                        console.log('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                    }
                }
                    
                console.log('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
                //android only
                console.log('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
                //amazon-fireos only
                //$("#app-status-ul").append('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');
            break;
            
            case 'error':
                alert('<li>ERROR -> MSG:' + e.msg + '</li>');
            break;
            
            default:
                alert('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            break;
        }
    }

    