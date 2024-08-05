import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "comments";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("file_id").unsigned().references("id").inTable("documents");
      table.integer("group_id").unsigned().references("id").inTable("groups");
      table.integer("supervisor_id");
      table.string("content").notNullable();
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
