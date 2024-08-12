import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
export default class UsersController {
  public async block({ params, response, session }: HttpContextContract) {
    const user = await User.find(params.id);
    if (user) {
      await user.block();
    }
    session.flash({ blocked: "Utilisateur bloqué avec succès !" });
    return response.redirect().toRoute("superadmin.dashboard");
  }

  public async unblock({ params, response, session }) {
    const user = await User.find(params.id);
    if (user) {
      await user.unblock();
    }
    session.flash({ unblocked: "Utilisateur debloqué avec succès !" });

    return response.redirect().toRoute("superadmin.dashboard");
  }
}
