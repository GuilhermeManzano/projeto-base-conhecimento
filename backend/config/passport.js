const { authSecret } = require('../.env')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

//Decodificando o token de acesso ao sistema, que está dentro do arquivo .env
module.exports = app => {
    const params = {
        secretOrKey: authSecret, //Chave para decodificar o token
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() //Está pegando o token bearer do banco de dados  
    }

    const strategy = new Strategy(params, (payload, done) => {
        app.db('users')
            .where({ id: payload.id })
            .first() //pegando o primeiro usuario
            .then(user => done(null, user ? { ...payload } : false))
            .catch(err => done(err, false))
    })

    passport.use(strategy)

    return {
        //Filtra as requisições e não permite que elas sejam feitas em cima dos webservices, que
        //precisam passar pelo passport (Ter o usuario logado)
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}