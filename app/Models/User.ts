// Importation des modules nécessaires
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

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

  public async getRole(): Promise<string> {
    const user = await User.find(this.id)
    return user ? user.role : ''
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  public updatedAt: DateTime
}
