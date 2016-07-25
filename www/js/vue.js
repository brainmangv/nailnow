new Vue({
    el: '#afui', 
    data: {
        conf_endereco: 'rua sobe desce',
    },
    ready: function() {
        console.log('Vuejs initialized with');
    },
    methods: {
        showAlert: function() {
          alert("Seu endereco : "+this.conf_endereco);
        }
    }
});