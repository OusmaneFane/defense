import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import Hash from "@ioc:Adonis/Core/Hash";
import Student from "App/Models/Student";
import Group from "App/Models/Group";
import Database from "@ioc:Adonis/Lucid/Database";
import Swal from "sweetalert2";
const axios = require("axios");
const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";
const schoolYear = "2023-2024";

export default class LoginController {
  public async index({ view }: HttpContextContract) {
    return view.render("login.index2");
  }

  public async check({ request, auth, response, session }) {
    const { email, password } = request.all();

    const user = await User.findBy("email", email);

    if (!user) {
      session.flash({ error: "Adresse e-mail incorrect" });
      return response.redirect().back();
    }
    // Vérifiez si l'utilisateur est bloqué
    if (user.blockedAt) {
      session.flash({ blocked: "Votre compte est bloqué" });
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
        return response.redirect().back();
      } else if (data.message === "Invalid credentials") {
        session.flash({ InvalidCredentials: "Mot de passe incorrect" });
        return response.redirect().back();
      }

      // Authentification réussie, connectez l'utilisateur
      await auth.use("web").login(user);

      // Récupérer l'étudiant dans la table users
      const student = await Student.findBy("user_id", user.id);

      // Récupérer le groupe de l'étudiant à partir de la table group_student
      const group = await Database.from("group_student")
        .where("student_id", student.id)
        .first();

      // Récupérer les membres du groupe
      const members = await Database.from("group_student")
        .where("group_id", group.group_id)
        .exec();

      // Récupérer la photo de l'utilisateur connecté via l'API externe
      const externalApiService = new ExternalApiService(apiBaseUrl, token);
      const include_photo = true;
      let userPhoto = null;

      try {
        const studentsInfo = await externalApiService.getStudentsPhoto(
          user.name,
          include_photo
        );
        if (studentsInfo && studentsInfo.length > 0) {
          userPhoto = studentsInfo[0].user_photo.base64;
        }
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des informations pour l'utilisateur ${user.name}:`,
          error
        );
      }
      console.log("UserPhoto ", userPhoto);

      session.flash({ connected: "Vous êtes connectés !" });

      return response.redirect().toRoute("student.dashboard", {
        student,
        group,
        members,
        userPhoto,
      });
    } else if (user.role === "supervisor") {
      await auth.use("web").login(user);
      session.flash({ connected: "Vous êtes connectés !" });
      return response.redirect().toRoute("supervisor.dashboard");
    } else if (user.role === "super_admin") {
      const isPasswordValid = await Hash.verify(user.password, password);
      if (!isPasswordValid) {
        session.flash({ InvalidCredentials: "Mot de passe incorrect" });
        Swal.fire({
          title: "Error!",
          text: "Do you want to continue",
          icon: "error",
          confirmButtonText: "Cool",
        });
        console.log("22222222");

        return response.redirect().back();
      } else {
        await auth.use("web").login(user);
        session.flash({ connected: "Vous êtes connectés !" });

        return response.redirect().toRoute("superadmin.dashboard");
      }
    }
  }

  public async logout({ auth, response, session }) {
    await auth.logout();
    session.flash({ disconnected: "Vous êtes deconnectés !" });
    return response.redirect().toRoute("login");
  }
}
