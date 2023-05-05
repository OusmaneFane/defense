import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StudentsController {

  public async dashboard({view, auth}: HttpContextContract){
    await auth.use('web').authenticate()
    return view.render('student.dashboard')
  }

}
