import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import Role from "App/Models/Role";
import Hash from "@ioc:Adonis/Core/Hash";
import Student from "App/Models/Student";
import Group from "App/Models/Group";
import Document from "App/Models/Document";
const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";

export default class AdminsController {
  public async dashboard({ view, auth }: HttpContextContract) {
    await auth.use("web").authenticate();
    //  const externalApiService = new ExternalApiService(apiBaseUrl, token);

    // try {
    //  const students = await externalApiService.getAllStudents();
    //   console.log(students);

    // }catch (error) {
    //   console.log(error);
    //}

    return view.render("super_admin.dashboard");
  }

  public async manage_users({ view }: HttpContextContract) {
    const users = await User.all();

    return view.render("super_admin.manage_users", { users: users });
  }

  public async create({ view }: HttpContextContract) {
    const roles = await Role.all();

    return view.render("super_admin.create", { roles: roles });
  }

  public async store({ response, request, session }: HttpContextContract) {
    const { name, email, role, password } = request.post();
    const hashedPassword = await Hash.make(password);

    // Créer une nouvelle instance de l'employé
    const user = new User();

    user.name = name;
    user.email = email;
    user.role = role;
    user.password = hashedPassword;
    await user.save();

    const student = new Student();
    student.name = name;
    student.email = email;
    student.user_id = user.id;
    await student.save();

    session.flash({ success: "L'utilisateur a été ajouté avec succès !" });
    return response.redirect().back();
  }

  public async edit({ view, params }: HttpContextContract) {
    const user = await User.findOrFail(params.id);
    const roles = await Role.all();
    // Récupération du mot de passe réel
    const password = user.password.split("$")[2];

    return view.render("super_admin.edit", { user, roles, password });
  }
  public async profil({ view, params }: HttpContextContract) {
    const user = await User.findOrFail(params.id);
    const student = await Student.findOrFail(params.id);

    const roles = await Role.all();
    const password = user.password.split("$")[2];

    // Récupérer la photo de l'utilisateur via l'API externe
    const externalApiService = new ExternalApiService(apiBaseUrl, token);
    const include_photo = true;
    let userPhoto = null;

    try {
      const studentsInfo = await externalApiService.getStudentsPhoto(
        student.name,
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
    console.log("UserPhoto: ", userPhoto);

    return view.render("super_admin.profil", {
      user,
      roles,
      password,
      userPhoto,
      student, // Transmettre la photo de l'utilisateur
    });
  }

  public async update({ params, request, response, session }) {
    const user = await User.findOrFail(params.id);

    user.merge(request.only(["name", "email", "role", "password"]));

    await user.save();
    session.flash({ success: "Modification effectuée avec succès" });

    return response.redirect().toRoute("superadmin.manage_users");
  }

  public async document_index({ view, auth }: HttpContextContract) {
    await auth.use("web").authenticate();
    const documents = await Document.all();
    const groups = await Group.query()
      .preload("supervisor")
      .preload("students")
      .preload("classes");

    return view.render("super_admin.documents.index", { documents, groups });
  }
}
