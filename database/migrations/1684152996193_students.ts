import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable();
      table.string('email', 150).notNullable();
      table.integer('class_id').unsigned().references('id').inTable('classes');
      // Copier les données des étudiants existants de la table "users" vers la table "students"
      this.schema.raw(`
        INSERT INTO ${this.tableName} (name, email)
        SELECT name, email
        FROM users
        WHERE role = 'student'
      `);

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}


