import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "add_blocked_at_to_users";

  public async up() {
    this.table("users", (table) => {
      table.timestamp("blocked_at").nullable(); // Ajoute la colonne blocked_at
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
