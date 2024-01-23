import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import Group from "App/Models/Group";
import Classe from "App/Models/Classe";
import Student from "App/Models/Student";
const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";
const schoolYear = "2023-2024";

export default class GroupsController {
  public async index({ view }: HttpContextContract) {
    const groups = await Group.query()
      .preload("supervisor")
      .preload("students")
      .preload("classes");

    return view.render("super_admin.groups.index", { groups: groups });
  }

  public async create({ view }: HttpContextContract) {
    const externalApiService = new ExternalApiService(apiBaseUrl, token);

    try {
      const allClasses = await externalApiService.getAllClasses(schoolYear);
      console.log(allClasses);

      const classes = await Classe.all();

      const etudiants = await User.query().where("role", "student").exec();
      const superviseurs = await User.query()
        .where("role", "supervisor")
        .exec();

      return view.render("super_admin.groups.create", {
        etudiants: etudiants,
        superviseurs: superviseurs,
        classes: classes,
        allClasses: allClasses,
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async store_class({ request, response, params }) {
    // Récupérer l'id de la classe'
    const id = await Classe.findOrFail(params.id);

    // régiriger vers la page de création de groupe
    return response.route("superadmin.create_group_view", { classeId: id });
  }

  public async view({ view, request }: HttpContextContract) {
    // Récupère les ids des classes sélectionnées
    const classIds = request.input("class_ids", []);

    // Charge les classes correspondantes
    const classes = await Classe.query().whereIn("id", classIds).exec();

    // Récupérer les étudiants des classes sélectionnées
    const etudiants = await Student.query()
      .whereIn("class_id", classIds)
      .whereNull("group_id")
      .preload("classe")
      .exec();

    // Récupérer tous les superviseurs
    const superviseurs = await User.query().where("role", "supervisor").exec();

    return view.render("super_admin.groups.create2", {
      classes,
      superviseurs,
      etudiants,
      classIds,
    });
  }

  public async store_group({ request, response }) {
    try {
      // Récupérer les données du formulaire
      const { name, supervisor, studentIds, class_ids } = request.all();
      console.log("StudentIDS", studentIds);
      const classIds = request.input("class_ids", []);

      // Créer un nouveau groupe
      const group = new Group();
      group.name = name;
      group.supervisor_id = supervisor;

      // Sauvegarder le groupe en base de données
      await group.save();
      // recuperer l'id du groupe et le mettre dans la table students
      const groupId = group.id;
      console.log("GroupID", groupId);
      // assigner l'id du groupe aux étudiants
      await Student.query()
        .whereIn("id", studentIds)
        .update({ group_id: groupId });

      // Attacher les étudiants au groupe
      await group.related("students").attach(studentIds);
      await group.related("classes").attach(classIds);

      return response.redirect().toRoute("superadmin.manage_groups");
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      return response
        .status(500)
        .send("Une erreur est survenue lors de la création du groupe.");
    }
  }
}
