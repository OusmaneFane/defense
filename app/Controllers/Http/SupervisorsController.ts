import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Student from "App/Models/Student";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import Group from "App/Models/Group";
import Classe from "App/Models/Classe";
import Document from "App/Models/Document";
import Message from "App/Models/Message";
const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";
const schoolYear = "2023-2024";
const incl_students_photo = true;

export default class SupervisorsController {
  public async dashboard({ view, auth }: HttpContextContract) {
    const externalApiService = new ExternalApiService(apiBaseUrl, token);

    await auth.use("web").authenticate();

    // recupérer l'étudiant connecté
    const supervisor = await User.findByOrFail("email", auth.user?.email);

    const groupInfo = await Database.from("groups")
      .where("supervisor_id", supervisor.id)
      .first();

    // recuperer les membres du groupe
    const members = await Database.from("group_student")
      .join("students", "group_student.student_id", "students.id")
      .where("group_student.group_id", groupInfo.id)
      .select("*");

    //boucles pour recuperer l'id des membres
    //let studentsName = [];
    //for (let i = 0; i < members.length; i++) {
    // studentsName.push(members[i].name);
    // }

    console.log("members: ", members);

    // recuperer l'encadrant du groupe avec la jointure de la table groups
    const supervisorWithGroupStudentInfo = await Database.from("groups")
      .join("group_student", "groups.id", "group_student.group_id")
      .where("group_id", groupInfo.id)
      .select("*");

    const users = await User.all();

    const classes = await Classe.all();
    // console.log('Membres: ', members)

    // recuperer tous les messages par le dernier message au premier
    const messages = await Message.query()
      .where("group_id", groupInfo.id)
      .preload("document")
      .orderBy("id", "asc")
      .exec();
    // convertir la date à laquelle le message a été envoyé sous forme 13:24
    for (let i = 0; i < messages.length; i++) {
      let currentDate = new Date(messages[i].created_at as string);
      var hours = currentDate.getHours().toString();
      var minutes = currentDate.getMinutes().toString();

      if (hours.length == 1) hours = "0" + hours;
      if (minutes.length == 1) minutes = "0" + minutes;
      messages[i].time = `${hours}:${minutes}`;
    }

    const documents = await Document.query().where("group_id", groupInfo.id);
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
    return view.render("supervisor.dashboard", {
      supervisor: supervisor,
      supervisorWithGroupStudentInfo: supervisorWithGroupStudentInfo,
      members: members,
      classes: classes,
      messages: messages,
      users: users,
      groupInfo: groupInfo,
      documents: documents,
    });
  }
}
