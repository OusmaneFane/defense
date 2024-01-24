import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import Group from "App/Models/Group";
import Classe from "App/Models/Classe";
import Student from "App/Models/Student";
import Hash from "@ioc:Adonis/Core/Hash";

const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";
const schoolYear = "2023-2024";

export default class GroupsController {
  public async index({ view }: HttpContextContract) {
    const externalApiService = new ExternalApiService(apiBaseUrl, token);

    const groups = await Group.query()
      .preload("supervisor")
      .preload("students")
      .preload("classes");
    // Récupérez les ID des classes à partir des groupes
    const classIds = groups.flatMap((group) =>
      group.classes.map((classe) => classe.id)
    );
    console.log("groups", groups);

    // Utilisez le service externe pour obtenir les informations sur les classes
    const classesInfo = await externalApiService.getAllClasses(schoolYear);

    const filteredClassesInfo = classesInfo.filter((classInfo) =>
      classIds.includes(classInfo.id)
    );

    console.log("filteredClassesInfo", filteredClassesInfo);

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

    const externalApiService = new ExternalApiService(apiBaseUrl, token);

    try {
      // Charge les classes correspondantes
      const classes = await Classe.query().whereIn("id", classIds).exec();

      // Utilisez le service de l'API externe pour récupérer les étudiants
      const etudiants = await externalApiService.getStudentsInClass(
        classIds,
        schoolYear
      );
      // Récupérer les étudiants des classes sélectionnées
      const etudiantsDataBASE = await Student.query()
        .whereIn("class_id", classIds)
        .whereNull("group_id")
        .preload("classe")
        .exec();

      // Récupérer tous les superviseurs
      const superviseurs = await User.query()
        .where("role", "supervisor")
        .exec();

      return view.render("super_admin.groups.create2", {
        classes,
        superviseurs,
        etudiants,
        classIds,
        etudiantsDataBASE,
      });
    } catch (error) {
      console.log(error);
      // Gérez les erreurs ici et renvoyez une réponse appropriée si nécessaire
      // Par exemple, vous pourriez rediriger l'utilisateur vers une page d'erreur
      return view.render("error", { error });
    }
  }

  public async store_group({ request, response }) {
    const externalApiService = new ExternalApiService(apiBaseUrl, token);
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
      console.log(group);

      // recuperer l'id du groupe et le mettre dans la table students
      // Récupérer les informations des étudiants via l'API externe
      // Récupérer les informations des étudiants via l'API externe
      const allStudentsInfo = await externalApiService.getStudentsInClass(
        classIds,
        schoolYear
      );

      // Filtrer les étudiants en fonction de studentIds
      const filteredStudentsInfo = allStudentsInfo.filter((studentInfo) =>
        studentIds.includes(studentInfo.user.username)
      );
      console.log("filteredStudentsInfo", filteredStudentsInfo);
      // Créer les utilisateurs et étudiants correspondants à partir des informations obtenues
      for (const studentInfo of filteredStudentsInfo) {
        const hashedPassword = await Hash.make("student"); // Utilisez un champ unique comme le nom d'utilisateur
        const user = await User.create({
          name: studentInfo.user.username,
          email: studentInfo.user.email,
          role: "student",
          password: hashedPassword,
        });

        const student = new Student();
        student.name = studentInfo.user.username;
        student.email = studentInfo.user.email;
        student.user_id = user.id;
        student.group_id = group.id;
        await student.save();
      }
      const groupId = group.id;
      console.log("GroupID", groupId);
      // assigner l'id du groupe aux étudiants
      //await Student.query()
      //  .whereIn("name", studentIds)
      // .update({ group_id: groupId });

      // Attacher les étudiants au groupe
      for (const studentInfo of filteredStudentsInfo) {
        console.log("studentInfo", studentInfo);

        const student = await Student.findBy("name", studentInfo.user.username);
        if (student) {
          console.log(
            `Étudiant trouvé pour le nom ${studentInfo.user.username}`
          );
          await group.related("students").attach([student.id]);
        } else {
          console.error(
            `Étudiant introuvable pour le nom ${studentInfo.user.username}`
          );
        }
      }
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
