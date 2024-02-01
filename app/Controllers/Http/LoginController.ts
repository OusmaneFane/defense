import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import Hash from "@ioc:Adonis/Core/Hash";
import Student from "App/Models/Student";
import Group from "App/Models/Group";
import Database from "@ioc:Adonis/Lucid/Database";
const axios = require("axios");

export default class LoginController {
  public async index({ view }: HttpContextContract) {
    return view.render("login.index");
  }

  public async check({ request, auth, response, session }) {
    const { email, password } = request.all();

    const user = await User.findBy("email", email);

    if (!user) {
      session.flash({ error: "Adresse e-mail incorrect" });
      return response.redirect().back();
    }

    if (user.role == "student") {
      const apiResponse = await axios.post(
        "https://api-staging.supmanagement.ml/auth/login",
        {
          username: user.name,
          password: password,
          rememberMe: true,
        }
      );

      const data = apiResponse.data;
      if (data === null) {
        session.flash({ error: "Une erreur s'est produite" });
        console.log("11111111");
        return response.redirect().back();
      } else if (data.message === "Invalid credentials") {
        session.flash({ error: "Mot de passe incorrect" });
        console.log("22222222");

        return response.redirect().back();
      }

      // Authentification réussie, connectez l'utilisateur
      await auth.use("web").login(user);
      console.log("yooooooooo");

      // Récupérer l'étudiant dans la table users
      const student = await Student.findBy("user_id", user.id);
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
      const isPasswordValid = await Hash.verify(user.password, password);
      if (!isPasswordValid) {
        session.flash({ error: "Mot de passe incorrect" });
        console.log("22222222");

        return response.redirect().back();
      } else {
        await auth.use("web").login(user);
        return response.redirect().toRoute("superadmin.dashboard");
      }
    }
  }

  public async logout({ auth, response }) {
    await auth.logout();
    return response.redirect().toRoute("login");
  }
}
