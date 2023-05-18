import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany,ManyToMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Group from './Group'
export default class Classe extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @belongsTo(() => Group)
  public group: BelongsTo<typeof Group>


  @manyToMany(() => Group, {
    pivotTable: 'group_classe',
    pivotForeignKey: 'classe_id',
    pivotRelatedForeignKey: 'group_id',
    pivotColumns: ['created_at', 'updated_at']
  })
  public classes: ManyToMany<typeof Group>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
