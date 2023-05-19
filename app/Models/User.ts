// Importation des modules nécessaires
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Student from './Student'

// Définition de la classe User
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public password: string // ne pas utiliser hash.make()

  @column()
  public role: string

  @belongsTo(() => Student)
  public student: BelongsTo<typeof Student>;


  @column()
  public class_id: number

  public async getRole(): Promise<string> {
    const user = await User.find(this.id)
    return user ? user.role : ''
  }

  // Méthode pour assigner l'étudiant à une classe
  public async assignToClass(classId: number) {
    this.class_id = classId;
    await this.save();
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  public updatedAt: DateTime
}
