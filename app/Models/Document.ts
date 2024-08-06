import { DateTime } from "luxon";
import { BaseModel, column, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import Comment from "./Comment";

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public user_id: number;

  @column()
  public group_id: number;

  @column()
  public file_name: string;

  @column()
  public file_path: string;

  @column()
  public file_type: string;

  @column()
  public file_size: number;

  @column()
  public file_extension: string;

  @hasMany(() => Comment, {
    foreignKey: "file_id",
  })
  public comments: HasMany<typeof Comment>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
