import Vue from 'vue'
import VueMq from 'vue-mq'

// Definindo o tamanho dos conteúdos para dispositivos com diferentes tipos de tamanhos,
//criando uma responsividade no site.

Vue.use(VueMq, {
    breakpoints: {
        xs: 576,
        sm: 768,
        md: 960,
        lg: 1140,
        xl: Infinity
    }
})