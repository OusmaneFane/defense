import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Hash from '@ioc:Adonis/Core/Hash'
export default class AdminsController {

  public async dashboard({ view, auth }: HttpContextContract) {
    await auth.use('web').authenticate()

    return view.render('super_admin.dashboard')
  }

  public async manage_users({ view }: HttpContextContract) {
    const users = await User.all()

    return view.render('super_admin.manage_users', { users: users })

  }

  public async create({ view }: HttpContextContract) {
    const roles = await Role.all()

    return view.render('super_admin.create', { roles: roles })

  }

  public async store({ response, request, session }: HttpContextContract) {
    const { name, email, role, password } = request.post()
    const hashedPassword = await Hash.make(password)

    // Créer une nouvelle instance de l'employé
    const user = new User()

    user.name = name
    user.email = email
    user.role = role
    user.password = hashedPassword
    await user.save()

    session.flash({ success: 'L\'employé a été ajouté avec succès !' })
    return response.redirect().back()


  }

  public async edit({ view, params }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    const roles = await Role.all()
    // Récupération du mot de passe réel
const password = user.password.split('$')[2]

    return view.render('super_admin.edit', { user, roles, password })

  }

  public async update({ params, request, response, session }) {

    const user = await User.findOrFail(params.id)

    user.merge(request.only(['name', 'email', 'role', 'password']))

    await user.save()
    session.flash({ success: "Modification effectuée avec succès" })

    return response.redirect().toRoute('superadmin.manage_users');
  }

}
