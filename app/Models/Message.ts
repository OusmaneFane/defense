import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Document from './Document'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public groupId: number


  @column()
  public sender_id: number

  @column()
  public content: string

  @column()
  public document_id: number

  @belongsTo(() => Document,{
    foreignKey: 'document_id'
  })
  public document: BelongsTo<typeof Document>

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
