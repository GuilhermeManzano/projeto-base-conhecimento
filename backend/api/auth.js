//Está importando o arquivo .env que tem a senha de autenticacao de usuario, é um arquivo oculto e que 
//NÃO pode ser enviado para o github ou compartilhada
const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const signin = async (req, res) => {
        //Caso o email ou senha não tenha sido informado, dá erro 400
        if (!req.body.email || !req.body.password) {
            return res.status(400).send('Informe usuário e senha!')
        }
        
        //pega o email digitado para consultar se o mesmo existe na base de dados
        const user = await app.db('users')
            .where({ email: req.body.email })
            .first()

        //Caso o email não esteja cadastrado, retorna erro 400
        if (!user) return res.status(400).send('Usuário não encontrado!')


        //Verifica se a senha hash do usuario é igual a do banco de dados
        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        if (!isMatch) return res.status(401).send('Email ou senha inválidos') //401 é acesso nao autorizado


        const now = Math.floor(Date.now() / 1000) //Pega a data atual 

        const payload = {
            id: user.id,
            name: user.name,
            admin: user.admin,
            iat: now,
            exp: now + (60 * 60 * 24 * 3) //A sessão do usuário irá expirar em 3 dias, a partir 
            //da data atual
        }

        res.json({
            ...payload,
            token: jwt.encode(payload, authSecret) //cria o token de acesso do usuario
        })
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if(userData) {
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            }
        } catch(e) {
            // problema com o token
        }

        res.send(false)
    }

    return { signin, validateToken }
}