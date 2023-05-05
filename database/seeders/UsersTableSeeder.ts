// Importation des modules nécessaires
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
// Définition de la classe UserSeeder
export default class extends BaseSeeder {
  public async run () {
    // Création des utilisateurs
     await Database.table('users').insert([
      {
      name: 'admin',
      email: 'admin@admin.com',
      password: (await Hash.make('admin')).toString(),
      role: 'super_admin'
      }
    ])

     await Database.table('users').insert([
      {
      name: 'student',
      email: 'student@student.com',
      password: (await Hash.make('student')).toString(),
      role: 'student'
      }
    ])

     await Database.table('users').insert([
      {
      name: 'supervisor',
      email: 'supervisor@supervisor.com',
      password: (await Hash.make('supervisor')).toString(),
      role: 'supervisor'
      }
    ])
  }
}
