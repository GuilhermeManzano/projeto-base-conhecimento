module.exports = middleware => {
    return (req, res, next) => {
        if(req.user.admin) {
            //Caso a requisição tenha sido feito pelo adm, ele permite acesso a todo o sistema
            middleware(req, res, next)
        } else {
            res.status(401).send('Usuário não é admistrador.')
        }
    }
}