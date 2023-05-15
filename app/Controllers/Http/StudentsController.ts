import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Student from 'App/Models/Student'
import Classe from 'App/Models/Classe'
import User from 'App/Models/User'
export default class StudentsController {

  public async dashboard({view, auth}: HttpContextContract){
    await auth.use('web').authenticate()
    return view.render('student.dashboard')
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
