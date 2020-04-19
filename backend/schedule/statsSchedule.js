const schedule = require('node-schedule')

module.exports = app => {
    //Forma padrrão para realizar a consulta ao mongodb a cada hora, de acordo
    //com a documentação do NPM
    schedule.scheduleJob('*/1 * * * *', async function () {
        const usersCount = await app.db('users').count('id').first()
        const categoriesCount = await app.db('categories').count('id').first()
        const articlesCount = await app.db('articles').count('id').first()

        const { Stat } = app.api.stat

        const lastStat = await Stat.findOne({}, {},
            { sort: { 'createdAt' : -1 } }) //Buscando a ultima estatistica gerada

        const stat = new Stat({
            users: usersCount.count,
            categories: categoriesCount.count,
            articles: articlesCount.count,
            createdAt: new Date()
        })

        //Verifica se o usuario, categorias ou artigos mudou. Ou seja, se algum arquivo foi alterado, adicionado
        //ou excluído do sistema. Caso positivo, então ativará a função para atualizar o sistema.
        const changeUsers = !lastStat || stat.users !== lastStat.users
        const changeCategories = !lastStat || stat.categories !== lastStat.categories
        const changeArticles = !lastStat || stat.articles !== lastStat.articles

        if(changeUsers || changeArticles || changeCategories) {
            stat.save().then(() => console.log('[Stats] Estatistícas atualizadas!'))
        }
    })
}