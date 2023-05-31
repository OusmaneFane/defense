import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Student from 'App/Models/Student'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
export default class extends BaseSeeder {
  public async run () {
    // Créer les étudiants dans la table "students"

    // Créer les étudiants dans la table "users"
    const users = [
      { name: 'Étudiant 1', email: 'etudiant1@example.com', password: (await Hash.make('student')).toString(), role: 'student' },
      { name: 'Étudiant 2', email: 'etudiant2@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 3', email: 'etudiant3@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 4', email: 'etudiant4@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 5', email: 'etudiant5@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 6', email: 'etudiant6@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 7', email: 'etudiant7@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 8', email: 'etudiant8@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 9', email: 'etudiant9@example.com', password: (await Hash.make('student')).toString(), role: 'student'  },
      { name: 'Étudiant 10', email: 'etudiant10@example.com', password: (await Hash.make('student')).toString(), role: 'student' },
      // Ajoutez plus d'étudiants si nécessaire
    ]



    const students = [
      { name: 'Étudiant 1', email: 'etudiant1@example.com' },
      { name: 'Étudiant 2', email: 'etudiant2@example.com' },
      { name: 'Étudiant 3', email: 'etudiant3@example.com' },
      { name: 'Étudiant 4', email: 'etudiant4@example.com' },
      { name: 'Étudiant 5', email: 'etudiant5@example.com' },
      { name: 'Étudiant 6', email: 'etudiant6@example.com' },
      { name: 'Étudiant 7', email: 'etudiant7@example.com' },
      { name: 'Étudiant 8', email: 'etudiant8@example.com' },
      { name: 'Étudiant 9', email: 'etudiant9@example.com' },
      { name: 'Étudiant 10', email: 'etudiant10@example.com' },
      // Ajoutez plus d'étudiants si nécessaire
    ]

    for (let i = 0; i < students.length; i++) {
      const _user = await User.create(users[i])
      await Student.create({...students[i], user_id: _user.id})
    }
  }
}
