import { DateTime } from "luxon";
import { BaseModel, column, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import Document from "./Document";
export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public group_id: number;

  @column()
  public file_id: number;

  @column()
  public supervisor_id: number;

  @column()
  public content: string;

  @belongsTo(() => Document, {
    foreignKey: "file_id",
  })
  public document: BelongsTo<typeof Document>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
