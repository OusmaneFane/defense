import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SupervisorsController {

  public async dashboard({view, auth}: HttpContextContract){
    await auth.use('web').authenticate()
    return view.render('supervisor.dashboard')
  }

}
