import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import Hash from '@ioc:Adonis/Core/Hash'


export default class LoginController {

public async index({view}: HttpContextContract){
    return view.render('login.index');
}

public async check({ request, auth, response, session }) {
  const { email, password } = request.all();


    const user = await User.findBy('email', email);
    await auth.use('web').attempt(email, password)
    if (!user) {
      session.flash({ error: 'Adresse e-mail incorrect'})
      return response.redirect().back()
    }

    const isPasswordValid = await Hash.verify(user.password, password)

    if (!isPasswordValid) {
      session.flash({ error: 'mot de passe incorrect'})
      return response.redirect().back()
    }



    if (user.role === 'student') {

      return response.redirect().toRoute('student.dashboard');
    } else if (user.role === 'supervisor') {

      return response.redirect().toRoute('supervisor.dashboard');
    } else if (user.role === 'super_admin') {

      return response.redirect().toRoute('superadmin.dashboard');
    }

}


}
