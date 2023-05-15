import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
export default class extends BaseSeeder {
  public async run () {
    // Créer les étudiants dans la table "students"
    await User.createMany([
      { name: 'Étudiant 1', email: 'etudiant1@example.com', role: 'student' },
      { name: 'Étudiant 2', email: 'etudiant2@example.com', role: 'student' },
      // Ajoutez plus d'étudiants si nécessaire
    ])
  }
}
