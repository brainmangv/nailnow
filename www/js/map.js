var ManicureMarks= function(map){
    this.map=map;
    this.markers = [];

    this.addMarker = function(location) {       
        var that=this;
        var marker = new google.maps.Marker({
           position: location,
            map: that.map,
            icon: {url:'images/pin-nailnow.png',anchor:{x:14,y:14}},
        });
        this.markers.push(marker);
    }

    /*
    this.addMarker = function(location) {
        var that=this;
        var markerOptions={
           position: location,
           icon: {url:'images/pin-nailnow.png'}
        };

        function onMarkerAdded(marker) {
            that.markers.push(marker);
            marker.setIconAnchor(14,14);
        }

        that.map.addMarker(markerOptions, onMarkerAdded);
    }
    */
    this.setMapOnAll = function(map) {
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(map);
        }
    }

    this.clearMarkers = function() {
        this.setMapOnAll(null);
    }

    this.showMarkers = function() {
        this.setMapOnAll(this.map);
    }

    this.deleteMarkers = function() {
        this.clearMarkers();
        this.markers = [];
    }
}

var Map_cliente = function(){
    this.map=null;
    this.myLatLng=null;
    this.addressLocation=null;
    this.myMarker=null;
    this.watchID=null;
    this.coordenadas=null;
    this.geocoder=null;
    this.manicureMarks;

    this.canvas = 'map-canvas';
    this.options={'searchBox':true,'locationButton':true,'watchPosition':true,'watchManicuresPositon':true}

    this.initMap = function() {
        console.log('init map');
        var that=this;        
        this.geocoder= new google.maps.Geocoder();
        this.myLatLng = new google.maps.LatLng(-18.9064, -41.9666);  

        this.map = new google.maps.Map(document.getElementById(this.canvas), {
            zoom: 3,
            center: that.myLatLng,
            disableDefaultUI: true
        });            
        
        this.manicureMarks = new ManicureMarks(this.map);    
        
        $(document).on('pagechange', function(){
             google.maps.event.trigger(that.map,'resize');
        });
        
        document.addEventListener("deviceready",this.calldialogGPS);
        if (this.options.searchBox) this.add_search_box();

        
        this.myMarker = new google.maps.Marker({
            map: this.map,
            icon: {url:'images/ic_my_location_1x_24dp.png',anchor:{x:14,y:14}},
            animation: google.maps.Animation.DROP,
        });
        
        if (this.options.locationButton) this.addYourLocationButton();      

        if (this.options.watchPosition) this.startWatch();

        if (this.options.watchManicuresPositon) this.startWatchManicure();            

        google.maps.event.addListener(this.map, 'dragstart', function() {
            that.hide_map_panel();       
        });                                
    
        google.maps.event.addListener(this.map, 'dragend', function() {
          that.show_map_panel();
          that.myLatLng = that.map.getCenter();         
            that.update_address_bar();
        });

        google.maps.event.addListener(this.map, 'zoom_changed', function() {
            if (this.getZoom() < 10) {
                // Change max/min zoom here
                this.setZoom(10);
                console.log('Zoom_changed');
            }
        })
    }   

    this.calldialogGPS = function() { 
        if (cordova)       
            cordova.dialogGPS('Seu GPS esta desativado, este aplicado precisa dele ativado para funcionar.','Use o GPS com wifi ou 3G',function(){},'Por favor ative o GPS',['','Ativar']);
        /*
        cordova.dialogGPS("Your GPS is Disabled, this app needs to be enable to works.",//message
                            "Use GPS, with wifi or 3G.",//description
                            function(buttonIndex){//callback
                            switch(buttonIndex) {
                                case 0: break;//cancel
                                case 1: break;//neutro option
                                case 2: break;//user go to configuration
                            }},
                            "Please Turn on GPS",//title
                            ["Cancel","Later","Go"]);//buttons
        });*/
    }

    this.addYourLocationButton = function(){
      var that=this;

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

      google.maps.event.addListener(this.map, 'dragend', function() {
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
                that.myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                console.log('location',that.myLatLng);
                that.myMarker.setPosition(that.myLatLng);
                that.map.setCenter(that.myLatLng);
                clearInterval(animationInterval);
                $('#you_location_img').css('background-position', '-144px 0px');
                that.update_address_bar();
            });
          }
          else{
              clearInterval(animationInterval);
              $('#you_location_img').css('background-position', '0px 0px');
          }
      });

      controlDiv.index = 1;
      this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
    } 

    this.add_search_box = function(){
        var map=this.map;
        var that=this;
        // Create the search box and link it to the UI element.
        //var input = document.getElementById('pac-input');
        //<input id="pac-input" class="controls" type="text" placeholder="Box de Pesquisa">
        var input = document.createElement('input');
        input.id='pac-input';
        input.class = 'controls';
        input.type='text';
        input.placeholder='Box de Pesquisa';
        
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        input.addEventListener('focusout', function() {
            that.show_map_panel();
            google.maps.event.trigger(that.map,'resize');
            console.log("focusout");
        });

        input.addEventListener('focus', function() {
            that.hide_map_panel();
            console.log("focus");
        });
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
            that.map.fitBounds(bounds);
            that.myLatLng = map.getCenter(); 
            that.update_address_bar();
            console.log(that.myLatLng.lat()+' '+that.myLatLng.lng());            
        }); //SearchBox
    }

    this.show_map_panel = function(){
        $(".map-float-box").removeClass('hide-float-box');
        $("#map-canvas").removeClass('full');        
    }

    this.show_map = function(){   
        this.show_map_panel();
        $.afui.loadContent("#mapa",false,false,"slide");     
        this.centerCurrentLocation();    
    }

    this.hide_map_panel = function(){
        $(".map-float-box").addClass('hide-float-box');
        $("#map-canvas").addClass('full');
    }

    this.update_address_bar =  function (){
        var latlng=this.myLatLng;
        var that = this;
        this.geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            $("#pac-input").val(results[0].formatted_address);
            that.addressLocation=results[0];
            //console.log('addressLocation '+addressLocation.address_components);
          } else {              
            console.log('Geocoder No results found');
            $("#pac-input").val('');
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
          $("#pac-input").val('');
        }
      });   
    }

    this.centerCurrentLocation = function(){
        var that=this;
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(success) {
                    if (that.map !== null){
                        that.myLatLng = new google.maps.LatLng(success.coords.latitude, success.coords.longitude);
                        that.map.setCenter(that.myLatLng);
                        that.map.setZoom(16);
                        that.show_map_panel();
                        that.update_address_bar();
                    }
                }, 
                function(error){
                    that.hide_map_panel();
                    that.calldialogGPS();
                    //alert('codigo: '    + error.code    + '\n' + 'messagem: ' + error.message + '\n');
                    /*$.afui.popup({title:'Sua localização não foi Encontrada',
                        message:'Digite seu endereço no campo acima.',
                        cancelOnly:true,
                        cancelText:"OK"
                    });*/
                }, 
                { timeout: 10000 } 
            )
        }
    }

    this.startWatch = function(){
        var that=this;
        this.watchPosition({accuracy:true},function(r){
            $oauth.updateGeoLocation(user.current.id,r.lat.toString(),r.lng.toString());
            that.myMarker.setPosition(r)
        },this.calldialohGPS);
    }

    this.stopWatch = function(){
        if(this.watchID){
          navigator.geolocation.clearWatch(this.watchID);
        }else{
          console.log("nao esta assistindo a posição");
        }
    }

    this.startWatchManicure = function(){
        this.stopWatchManicure();
        this.intervalID = window.setInterval(this.updateManicureMarks, 5000);
    }

    this.stopWatchManicure = function(){
        if(this.intervalID){
            clearInterval(this.intervalID);
        }
    }

    this.watchPosition = function (opcs,success,error){
        var that=this;
        this.stopWatch();
        var timeout = (opcs && opcs.timeout && opcs.timeout>0?opcs.timeout:0);
        var accuracy = (opcs && opcs.accuracy && opcs.accuracy>0?opcs.accuracy:0);

        var posOptions = {enableHighAccuracy: (accuracy===false?false:true)};

        if(!this.coordenadas && timeout > 0){
          timeout = (timeout>40000?timeout:40000);
        }
        if(timeout && timeout > 0){
          posOptions.timeout = timeout;
        }

        this.watchID = navigator.geolocation.watchPosition(
            function(position){       
                var lat  = position.coords.latitude;
                var lng  = position.coords.longitude;

                var retOri = {lat:lat,lng:lng};
                  //lat = number_format(lat,4)*1;
                  //lng = number_format(lng,4)*1;

                var ret = {lat:lat,lng:lng};

                if(that.coordenadas && that.coordenadas.lat && that.coordenadas.lng){
                  if( that.coordenadas.lat != lat ||  that.coordenadas.lng != lng){
                    that.coordenadas = ret;
                   // console.log("pegou posição - ",position);
                    success(retOri);
                  }else{
                    console.log('não alterou a posição');
                  }
                }else{
                  that.coordenadas = ret;
                  success(retOri);
                }

            },

            function(err){
                error(err);
            },
            posOptions
        );
    }

    this.updateManicureMarks = function(){
       //console.log('escutando');
        $oauth.getGeolocations()        
        .done(function(r){
            map_cliente.manicureMarks.deleteMarkers();            
            r.locations.forEach(function(l){
                var position =new google.maps.LatLng(l.latitude,  l.longitude);
                console.log(l.id,position.lat(),position.lng(),l.timestamp);
                map_cliente.manicureMarks.addMarker(position);
            })
        })
        .fail(function(response){
            if($oauth.isExpired())  this.stopWatchManicure();
        });
        map_cliente.manicureMarks.showMarkers();        
    }

    
    this.tracaRota = function(lat,lng){
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;        
        directionsDisplay.setMap(this.map);
        $("#map-route p").html(order.endereco);
        $("#map-route").css('top','0px');
        directionsService.route({
            origin: this.myLatLng,
            destination: new google.maps.LatLng(lat, lng),
            travelMode: google.maps.TravelMode.DRIVING
        }, function(response, status) {
            console.log('direction',response);
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    return this;
}

var  Map_manicure = function(){
    this.canvas='map-canvas2';
    this.options.searchBox=false;
    this.options.watchPosition=true;
    this.options.watchManicuresPositon=false;
    this.online=false;    
    this.show_map = function(){   
        //this.show_map_panel();        
        $.afui.loadContent("#mapa",false,false,"slide");     
        this.centerCurrentLocation();    
    }

    this.show_map_panel = function(){}
    this.hide_map_panel = function(){}    
    this.update_address_bar = function(){}
    this.startProgressBar = function (){
        var intObj = {
                template: 3, 
                parent: '#map-canvas2'
            };
        this.indeterminateProgress = new Mprogress(intObj);
        this.indeterminateProgress.start();    
    }

    this.stopProgressBar = function (){
        if (this.indeterminateProgress) this.indeterminateProgress.end();
    }

    this.startWatch = function(){
        this.bgGeo();
        /*
        var that=this;        
        this.watchPosition({accuracy:true},function(r){
            //console.log('updateGeoLocation',r.lat.toString(),r.lng.toString());
            if(that.online) 
                $oauth.updateGeoLocation(user.current.id,r.lat.toString(),r.lng.toString());
            that.myLatLng = new google.maps.LatLng(r.lat, r.lng);
            that.myMarker.setPosition(r);
        },this.calldialohGPS);
        */
    }

    this.bgGeo = function(){
        var callbackFn = function(location) {
            console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);

            // Do your HTTP request here to POST location to your server.
            // jQuery.post(url, JSON.stringify(location));

            /*
            IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
            and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            */
            backgroundGeolocation.finish();
        };

        var failureFn = function(error) {
            console.log('BackgroundGeolocation error');
        };

        // BackgroundGeolocation is highly configurable. See platform specific configuration options
        backgroundGeolocation.configure(callbackFn, failureFn, {
            desiredAccuracy: 0,
            stationaryRadius: 0,
            distanceFilter: 0,
            debug: true,
            interval: 6000
        });

        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        backgroundGeolocation.start();

        // If you wish to turn OFF background-tracking, call the #stop method.
        // backgroundGeolocation.stop();  
    }

    return this;
}

Map_manicure.prototype= new Map_cliente();
