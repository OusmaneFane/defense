import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Student from 'App/Models/Student'
import Classe from 'App/Models/Classe'
import User from 'App/Models/User'
import Group from 'App/Models/Group'
import Database from '@ioc:Adonis/Lucid/Database'
export default class StudentsController {

  public async dashboard({view, auth}: HttpContextContract){
    await auth.use('web').authenticate()

    // recupérer l'étudiant connecté
    const student = await Student.findByOrFail('email', auth.user?.email)
    const group = await Database.from('group_student').where('student_id', student.id).first()

      // recuperer les membres du groupe
      const members = await Database.from('group_student')
      .join('students', 'group_student.student_id', 'students.id')

      .where('group_id', group.group_id)
      .select('*')

      // recuperer l'encadrant du groupe avec la jointure de la table groups
      const supervisor = await Database.from('groups')
      .join('group_student', 'groups.id', 'group_student.group_id')
      .where('group_id', group.group_id)
      .select('*')


      const group2 = await Group.query().where('id', group.group_id).preload('supervisor').firstOrFail()
    const supervisor2 = group2.supervisor_id
  //  console.log('Supervisor2: ', supervisor2)
    // recuperer l'encadrant du groupe avec la jointure de la table users
    const supervisor3 = await User.query().where('id', supervisor2).firstOrFail()
    //console.log('Supervisor3: ', supervisor3)


      const classes = await Classe.all()
     // console.log('Membres: ', members)




    return view.render('student.dashboard', {student: student, group: group, members: members, classes: classes, supervisor: supervisor, supervisor3: supervisor3})
  }


  public async showAssignClassForm({view, params}: HttpContextContract){
    // Récupérer l'ID de la classe à partir des paramètres
    const { id } = params


      // Récupérer la classe correspondante
      const classe = await Classe.findOrFail(id)

      // Récupérer tous les étudiants qui n'ont pas de classe associée
      const students = await Student.query().whereNull('class_id').exec()


      return view.render('student.assignClass', { classe, students })


  }

  public async assignToClass({ request, response, params }) {
    const { classId } = params;
    const { students } = request.all();

    // Logique de traitement pour assigner les étudiants à la classe
    // Par exemple, vous pouvez utiliser une boucle pour parcourir les ID des étudiants sélectionnés
    for (const studentId of students) {
      // Récupérer l'étudiant par son ID depuis votre modèle Student
      const student = await Student.findOrFail(studentId);

      // Assigner l'étudiant à la classe correspondante
      await student.assignToClass(classId);
    }

    // Redirection vers une autre page ou affichage d'un message de succès
    return response.redirect().toRoute('superadmin.manage_classe');
  }
}
