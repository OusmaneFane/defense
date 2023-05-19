import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Group from './Group'
import Classe from './Classe'
import User from './User'
export default class Student extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string
  @column()
  public email: string
  @column()
  public class_id: number

  // Méthode pour assigner l'étudiant à une classe
  public async assignToClass(classId: number) {
    this.class_id = classId;
    await this.save();
  }


  @belongsTo(() => Classe, {
    foreignKey: 'class_id',
  })
  public classe: BelongsTo<typeof Classe>

  @manyToMany(() => Group, {
    pivotTable: 'group_student',
    pivotForeignKey: 'student_id',
    pivotRelatedForeignKey: 'group_id',
    pivotColumns: ['created_at', 'updated_at']
  })
  public groups: ManyToMany<typeof Group>



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
