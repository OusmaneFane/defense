import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckUserRole {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>, allowedRoles: string[]) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const user = await auth.authenticate()
    const role = await user.getRole()

    if (!allowedRoles.includes(role)) {
      return response.unauthorized({ error: { message: 'Unauthorized access' } })
    }
    await next()
  }
}
