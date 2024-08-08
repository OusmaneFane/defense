import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import Group from "App/Models/Group";
import Classe from "App/Models/Classe";
import Student from "App/Models/Student";
import Hash from "@ioc:Adonis/Core/Hash";
import Database from "@ioc:Adonis/Lucid/Database";
import db from "@adonisjs/lucid/services/db";
import Document from "App/Models/Document";
import Message from "App/Models/Message";

const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";
const schoolYear = "2023-2024";

export default class GroupsController {
  public async index({ view, request }: HttpContextContract) {
    const groups = await Group.query()
      .preload("supervisor")
      .preload("students")
      .preload("classes");
    console.log(groups);

    return view.render("super_admin.groups.index", {
      groups: groups,
      currentRoute: request.url(),
    });
  }

  public async create({ view, request }: HttpContextContract) {
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
        currentRoute: request.url(),
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
      const etudiantsDataBASE = [];

      for (const classId of classIds) {
        try {
          const etudiants = await externalApiService.getStudentsInClass(
            [classId],
            schoolYear
          );
          etudiantsDataBASE.push(...etudiants);
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des étudiants pour la classe ${classId}:`,
            error
          );
        }
      }

      // Récupérer tous les superviseurs
      const superviseurs = await User.query()
        .where("role", "supervisor")
        .exec();

      return view.render("super_admin.groups.create2", {
        classes,
        superviseurs,
        classIds,
        etudiantsDataBASE,
        currentRoute: request.url(),
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
      const { name, supervisor, studentIds } = request.all();
      console.log("StudentIDS", studentIds);
      const classIds = request.input("class_ids", []);

      // Créer un nouveau groupe
      const group = new Group();
      group.name = name;
      group.supervisor_id = supervisor;

      // Sauvegarder le groupe en base de données
      await group.save();
      console.log(group);

      let allStudentsInfo = [];

      // Boucle à travers chaque identifiant de classe
      for (const classId of classIds) {
        try {
          // Appel de la fonction getStudentsInClass pour chaque classe
          const studentsInfo = await externalApiService.getStudentsInClass(
            classId,
            schoolYear
          );

          // Ajout des informations des étudiants de cette classe à la liste
          allStudentsInfo = allStudentsInfo.concat(studentsInfo);
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des étudiants pour la classe ${classId}:`,
            error
          );
        }
      }

      // Maintenant, allStudentsInfo contient les informations des étudiants de toutes les classes sélectionnées
      console.log("Informations de tous les étudiants :", allStudentsInfo);

      // Filtrer les étudiants en fonction de studentIds
      const filteredStudentsInfo = allStudentsInfo.filter((studentInfo) =>
        studentIds.includes(studentInfo.user.username)
      );
      console.log("filteredStudentsInfo", filteredStudentsInfo);

      // Créer les utilisateurs et étudiants correspondants à partir des informations obtenues
      for (const studentInfo of filteredStudentsInfo) {
        try {
          const hashedPassword = await Hash.make("student");
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
        } catch (error) {
          console.error(
            `Erreur lors de la création de l'étudiant ${studentInfo.user.username}:`,
            error
          );
        }
      }

      const groupId = group.id;
      console.log("GroupID", groupId);

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

      // Récupérer les informations de toutes les classes à partir de l'API
      const allClassesInfo = await externalApiService.getAllClasses(schoolYear);

      // Créer et attacher les nouvelles classes au groupe
      for (const classId of classIds) {
        try {
          // Rechercher la classe correspondant à l'ID dans les informations de toutes les classes
          const classInfo = allClassesInfo.find((info) => info.id === classId);
          if (classInfo) {
            // Vérifier si la classe existe déjà dans la base de données
            let classe = await Classe.findBy("id", classInfo.id);
            if (!classe) {
              // Si la classe n'existe pas, la créer avec les informations de l'API
              classe = await Classe.create({
                id: classInfo.id,
                name: classInfo.libelle,
                description: classInfo.niveau_programme.programme.libelle,
              });
            }

            // Attacher la classe au groupe
            await group.related("classes").attach([classe.id]);
          } else {
            console.error(`Classe non trouvée pour l'ID ${classId}`);
          }
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des informations pour la classe ${classId}:`,
            error
          );
        }
      }

      return response.redirect().toRoute("superadmin.manage_groups");
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      return response
        .status(500)
        .send("Une erreur est survenue lors de la création du groupe.");
    }
  }
  public async show({ params, view, request }: HttpContextContract) {
    const group = await Group.query()
      .where("id", params.id)
      .preload("supervisor")
      .preload("students")
      .preload("classes")
      .firstOrFail();

    const documents = await Document.query()
      .where("group_id", params.id)
      .preload("comments"); // Précharge les commentaires

    // Convertir chaque document en JSON
    const documentsJson = documents.map((doc) => doc.toJSON());

    return view.render("super_admin.groups.show", {
      group: group.toJSON(),
      documents: documentsJson,
      currentRoute: request.url(),
    });
  }
  public async showGroupChat({
    view,
    auth,
    params,
    request,
  }: HttpContextContract) {
    await auth.use("web").authenticate();

    const externalApiService = new ExternalApiService(apiBaseUrl, token);

    // recupérer l'étudiant connecté
    const supervisor = await User.findByOrFail("email", auth.user?.email);

    const groupInfo = await Database.from("groups")
      .where("id", params.id)
      .first();
    console.log("GroupID: ", groupInfo.name);

    // recuperer les membres du groupe
    const members = await Database.from("group_student")
      .join("students", "group_student.student_id", "students.id")
      .where("group_student.group_id", params.id)
      .select("*");
    console.log("membres: ", members);

    //boucles pour recuperer l'id des membres
    //let studentsName = [];
    //for (let i = 0; i < members.length; i++) {
    // studentsName.push(members[i].name);
    // }

    // recuperer l'encadrant du groupe avec la jointure de la table groups
    const supervisorWithGroupStudentInfo = await Database.from("groups")
      .join("group_student", "groups.id", "group_student.group_id")
      .where("group_id", params.id)
      .select("*");

    const users = await User.all();

    const classes = await Classe.all();
    // console.log('Membres: ', members)

    // recuperer tous les messages par le dernier message au premier
    const messages = await Message.query()
      .where("group_id", params.id)
      .preload("document")
      .orderBy("id", "asc")
      .exec();
    console.log("Messages : ", messages);

    // convertir la date à laquelle le message a été envoyé sous forme 13:24
    for (let i = 0; i < messages.length; i++) {
      let currentDate = new Date(messages[i].created_at as string);
      var hours = currentDate.getHours().toString();
      var minutes = currentDate.getMinutes().toString();

      if (hours.length == 1) hours = "0" + hours;
      if (minutes.length == 1) minutes = "0" + minutes;
      messages[i].time = `${hours}:${minutes}`;
    }

    const documents = await Database.from("documents").where(
      "group_id",
      params.id
    );
    /*
    let allStudentsInfo = [];
    try {
      // Appel de la fonction getStudentsInClass pour chaque classe
      const studentsInfo = await externalApiService.getStudentsPhoto(
        schoolYear,
        incl_students_photo
      );
      console.log("studentsInfo :", studentsInfo);

      // Ajout des informations des étudiants de cette classe à la liste
      allStudentsInfo = allStudentsInfo.concat(studentsInfo);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des étudiants pour la classe`,
        error
      );
    }
    // Maintenant, allStudentsInfo contient les informations des étudiants de toutes les classes sélectionnées
    console.log("Informations de tous les étudiants :", allStudentsInfo);

    // Filtrer les étudiants en fonction de studentIds
    const filteredStudentsInfo = allStudentsInfo.filter((studentInfo) =>
      studentsName.includes(studentInfo.user.username)
    );
    console.log("filteredStudentsInfo", filteredStudentsInfo);
*/
    // Mapper les résultats pour extraire uniquement les noms
    const memberNames = members.map((member) => member.name);
    //voir le name des membres dans la console
    const include_photo = true;
    const membersPhotos = [];
    for (const username of memberNames) {
      try {
        const studentsInfo = await externalApiService.getStudentsPhoto(
          username,
          include_photo
        );
        const memberPhoto = studentsInfo.map(
          (studentInfo) => studentInfo.user_photo.base64
        );
        membersPhotos.push(...memberPhoto);
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des informations pour l'utilisateur ${username}:`,
          error
        );
      }
    }
    members.forEach((member, index) => {
      member.photo = membersPhotos[index]; // Ajoutez une propriété 'photo' à chaque membre
    });
    return view.render("supervisor.groups.chat", {
      supervisor: supervisor,
      supervisorWithGroupStudentInfo: supervisorWithGroupStudentInfo,
      members: members,
      classes: classes,
      messages: messages,
      users: users,
      groupInfo: groupInfo,
      documents: documents,
      currentRoute: request.url(),
    });
  }
  public async showDocuments({
    params,
    view,
    auth,
    request,
  }: HttpContextContract) {
    await auth.use("web").authenticate();
    const groupId = params.id;
    const group = await Group.findOrFail(groupId);
    const documents = await Database.from("documents").where(
      "group_id",
      groupId
    );
    const users = await User.all();
    const commentData = await Database.from("comments")
      .where("group_id", groupId)
      .exec();
    console.log("commentData : ", commentData);
    return view.render("supervisor.groups.documents", {
      group,
      documents,
      users,
      commentData,
      currentRoute: request.url(),
    });
  }
}
