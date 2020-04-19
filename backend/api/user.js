const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    // Criando um encriptador de senhas
    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const save = async (req, res) => {
        const user = { ...req.body }
        if (req.params.id) user.id = req.params.id

        //Caso um usuario que não seja admin tente criar um usuario admin novo, ele será negado
        if(!req.originalUrl.startsWith('/users')) user.admin = false
        if(!req.user || !req.user.admin) user.admin = false

        try {
            //Verificando se os campos do cadastro foram preenchidos corretamentes
            existsOrError(user.name, 'Nome não informado')
            existsOrError(user.email, 'E-mail não informado')
            existsOrError(user.password, 'Senha não informada')
            existsOrError(user.confirmPassword, 'Confirmação de senha inválida')
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem')

            //Verifica se o usuario já foi cadastrado, pegando um usuário do banco de dados
            const userFromDB = await app.db('users')
                .where({ email: user.email }).first()
            if (!user.id) {
                notExistsOrError(userFromDB, 'Usuário já cadastrado')
            }
        } catch (msg) {
            //Caso ocorra o erro, retorna o status 400(erro do usuario) e exibe a msg de erro
            return res.status(400).send(msg)
        }

        //Criptografando a senha do usuário
        user.password = encryptPassword(user.password)
        delete user.confirmPassword

        if (user.id) {
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .whereNull('deletedAt')
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('users')
                .insert(user)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    //Retornando todos os usuários cadastrados, retornando seu id, nome, email e se é ou não admin
    const get = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .whereNull('deletedAt')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    //Realizando o filtro dos usuários através do seu ID
    const getById = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: req.params.id })
            .whereNull('deletedAt')
            .first()
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    const remove = async (req, res) => {
        try {
            //Caso o usuário possua artigos, não é possível excluí-lo
            const articles = await app.db('articles')
                .where({ userId: req.params.id })
            notExistsOrError(articles, 'Usuário possui artigos.')

            //Caso o usuário não seja encontrado, não é possível excluí-lo
            const rowsUpdated = await app.db('users')
                .update({ deletedAt: new Date() })
                .where({ id: req.params.id })
            existsOrError(rowsUpdated, 'Usuário não foi encontrado.')

            //Caso o usuário seja excluído com sucesso, retornará o status 204.
            res.status(204).send()
        } catch (msg) {
            res.status(400).send(msg)
        }
    }

    return { save, get, getById, remove }
}