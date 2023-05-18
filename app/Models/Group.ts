import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Student from './Student'
import Classe from './Classe'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public supervisor_id: number

  @manyToMany(() => Student, {
    pivotTable: 'group_student',
    pivotForeignKey: 'group_id',
    pivotRelatedForeignKey: 'student_id',
    pivotColumns: ['created_at', 'updated_at']
  })
  public students: ManyToMany<typeof Student>

  @belongsTo(() => User, {
    foreignKey: 'supervisor_id',
  })
  public supervisor: BelongsTo<typeof User>

  // @belongsTo(() => Classe, {
  //   foreignKey: 'id',
  // })
  // public classe: BelongsTo<typeof Classe>
  @manyToMany(() => Classe, {
    pivotTable: 'group_classe',
    pivotForeignKey: 'group_id',
    pivotRelatedForeignKey: 'classe_id',
    pivotColumns: ['created_at', 'updated_at']
  })
  public classes: ManyToMany<typeof Classe>


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
