const mongoose = require('mongoose')
//Criando o bando de dados no monogodb
mongoose.connect('mongodb://localhost/knowledge_stats', { useNewUrlParser: true })
    .catch(e => {
        const msg = 'ERRO! Não foi possível conectar com o MongoDB!'
        console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m') //Colocando o texto de erro na cor vermelha
    })
