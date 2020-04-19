//Criando a coluna do usuário
exports.up = function (knex, Promise) {
    return knex.schema.alterTable('users', table => {
        table.timestamp('deletedAt')
    })
};

//Deletando a coluna do usuário 
exports.down = function (knex, Promise) {
    return knex.schema.alterTable('users', table => {
        table.dropColumn('deletedAt')
    })
};
