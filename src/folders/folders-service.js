const FoldersService = {
  getAllFolders(knex) {
    return knex.select('*').from('noteful_folders')
  }, 
  insertFolder(knex, newFolder) {
    return knex
       .insert(newFolder)
       .into('noteful_folders')
       .returning('*')
       .then(rows => {
          return rows[0]
        })
  }
}

module.exports = FoldersService