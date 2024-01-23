import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import Hash from "@ioc:Adonis/Core/Hash";
import Student from "App/Models/Student";
import Group from "App/Models/Group";
import Database from "@ioc:Adonis/Lucid/Database";

export default class LoginController {
  public async index({ view }: HttpContextContract) {
    return view.render("login.index");
  }

  public async check({ request, auth, response, session }) {
    const { email, password } = request.all();

    const user = await User.findBy("email", email);
    await auth.use("web").attempt(email, password);
    if (!user) {
      session.flash({ error: "Adresse e-mail incorrect" });
      return response.redirect().back();
    }

    const isPasswordValid = await Hash.verify(user.password, password);

    if (!isPasswordValid) {
      session.flash({ error: "mot de passe incorrect" });
      return response.redirect().back();
    }

    if (user.role === "student") {
      // Récupérer l'étudiant dans la table users
      // console.log('user_id: ', user.id)
      const student = await Student.findBy("user_id", user.id);
      // console.log('Etudiant: ', student)
      // récuperer l'étudiant dans la table students

      // recuperer l'id de l'étudiant
      //console.log('Id de letudiant: ', student.id)

      // récuperer le groupe de l'étudiant à partir de la table group_student
      const group = await Database.from("group_student")
        .where("student_id", student.id)
        .first();

      // recuperer les membres du groupe
      const members = await Database.from("group_student")
        .where("group_id", group.group_id)
        .exec();
      //console.log('Membres: ', members.length)

      return response
        .redirect()
        .toRoute("student.dashboard", { student, group, members });
    } else if (user.role === "supervisor") {
      return response.redirect().toRoute("supervisor.dashboard");
    } else if (user.role === "super_admin") {
      return response.redirect().toRoute("superadmin.dashboard");
    }
  }

  public async logout({ auth, response }) {
    await auth.logout();
    return response.redirect().toRoute("login");
  }
}
