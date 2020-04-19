const config = require('../knexfile.js')
const knex = require('knex')(config)

//Atualiza as informações do banco de dados automaticante, após as alterações serem salvas
knex.migrate.latest([config])

module.exports = knex