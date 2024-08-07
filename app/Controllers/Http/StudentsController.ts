import Message from "App/Models/Message";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Student from "App/Models/Student";
import Classe from "App/Models/Classe";
import User from "App/Models/User";
import Group from "App/Models/Group";
import Database from "@ioc:Adonis/Lucid/Database";
import Document from "App/Models/Document";
import Comment from "App/Models/Comment";
import { google } from "googleapis";
const path = require("path");
const mime = require("mime");
import fs from "fs";
import Application from "@ioc:Adonis/Core/Application";
const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";
const schoolYear = "2023-2024";
async function uploadFileToDrive(auth, filePath, folderId, mimeType) {
  const drive = google.drive({ version: "v3", auth });

  const fileName = path.basename(filePath);

  const media = {
    mimeType: "application/" + mimeType,
    body: fs.createReadStream(filePath),
  };

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("File uploaded. File ID:", response.data.id);
  } catch (error) {
    console.error("Error uploading file:", error.message);
  }
}
export default class StudentsController {
  public async dashboard({ view, auth }: HttpContextContract) {
    await auth.use("web").authenticate();

    // recupérer l'étudiant connecté
    const student = await Student.findByOrFail("email", auth.user?.email);

    const group = await Database.from("group_student")
      .where("student_id", student.id)
      .first();

    // recuperer les membres du groupe
    const members = await Database.from("group_student")
      .join("students", "group_student.student_id", "students.id")
      .where("group_student.group_id", group.group_id)
      .select("*");
    // Mapper les résultats pour extraire uniquement les noms
    const memberNames = members.map((member) => member.name);
    //voir le name des membres dans la console
    console.log("members name :", memberNames);

    // recuperer l'encadrant du groupe avec la jointure de la table groups
    const supervisor = await Database.from("groups")
      .join("group_student", "groups.id", "group_student.group_id")
      .where("group_id", group.group_id)
      .select("*");

    const group2 = await Group.query()
      .where("id", group.group_id)
      .preload("supervisor")
      .firstOrFail();
    const supervisor2 = group2.supervisor_id;

    // recuperer l'encadrant du groupe avec la jointure de la table users
    const supervisor3 = await User.query()
      .where("id", supervisor2)
      .firstOrFail();
    //console.log('Supervisor3: ', supervisor3)

    const users = await User.all();
    const infoGroup = await Group.query()
      .where("id", group.group_id)
      .firstOrFail();

    const classes = await Classe.all();
    // console.log('Membres: ', members)

    // recuperer tous les messages par le dernier message au premier
    const messages = await Message.query()
      .where("group_id", group.group_id)
      .preload("document") // Charger la relation "document"
      .orderBy("id", "asc")
      .exec();
    for (let i = 0; i < messages.length; i++) {
      let currentDate = new Date(messages[i].created_at as string);
      var hours = currentDate.getHours().toString();
      var minutes = currentDate.getMinutes().toString();

      if (hours.length == 1) hours = "0" + hours;
      if (minutes.length == 1) minutes = "0" + minutes;
      messages[i].time = `${hours}:${minutes}`;
    }

    // recuperer le nom de l'utilisateur connecté
    const username = await User.findByOrFail("email", auth.user?.email);

    const documents = await Document.query().where("group_id", group.group_id);
    const externalApiService = new ExternalApiService(apiBaseUrl, token);
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

    return view.render("student.dashboard", {
      student: student,
      group: group,
      members: members,
      classes: classes,
      supervisor: supervisor,
      supervisor3: supervisor3,
      messages: messages,
      username: username.name,
      users: users,
      infoGroup: infoGroup,
      documents: documents,
      memberPhotos: membersPhotos,
    });
  }

  public async showAssignClassForm({
    view,
    params,
    auth,
  }: HttpContextContract) {
    await auth.use("web").authenticate();
    // Récupérer l'ID de la classe à partir des paramètres
    const { id } = params;

    // Récupérer la classe correspondante
    const classe = await Classe.findOrFail(id);

    // Récupérer tous les étudiants qui n'ont pas de classe associée
    const students = await Student.query().whereNull("class_id").exec();

    return view.render("student.assignClass", { classe, students });
  }

  public async assignToClass({ request, response, params, auth }) {
    await auth.use("web").authenticate();
    const { classId } = params;
    const { students } = request.all();

    // Logique de traitement pour assigner les étudiants à la classe
    // Par exemple, vous pouvez utiliser une boucle pour parcourir les ID des étudiants sélectionnés
    for (const studentId of students) {
      // Récupérer l'étudiant par son ID depuis votre modèle Student
      const student = await Student.findOrFail(studentId);

      // Assigner l'étudiant à la classe correspondante
      await student.assignToClass(classId);
    }

    // Redirection vers une autre page ou affichage d'un message de succès
    return response.redirect().toRoute("superadmin.manage_classe");
  }
  public async upload({ view, auth }: HttpContextContract) {
    await auth.use("web").authenticate();

    // Récupérer l'étudiant connecté
    const student = await Student.findByOrFail("email", auth.user?.email);
    const group = await Database.from("group_student")
      .where("student_id", student.id)
      .first();

    // Récupérer les membres du groupe
    const members = await Database.from("group_student")
      .join("students", "group_student.student_id", "students.id")
      .where("group_student.group_id", group.group_id)
      .select("*");

    // Récupérer l'encadrant du groupe avec la jointure de la table groups
    const supervisorData = await Database.from("groups")
      .join("group_student", "groups.id", "group_student.group_id")
      .where("group_student.group_id", group.group_id)
      .select("groups.*")
      .first();

    const supervisor2 = supervisorData?.supervisor_id;
    const supervisor = await User.query()
      .where("id", supervisor2)
      .firstOrFail();
    const memberNames = members.map((member) => member.name);
    const externalApiService = new ExternalApiService(apiBaseUrl, token);

    const users = await User.all();
    const infoGroup = await Group.query()
      .where("id", group.group_id)
      .firstOrFail();
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

    // Récupérer les documents et les commentaires
    const documents = await Document.query()
      .where("group_id", group.group_id)
      .preload("comments");

    const commentData = await Database.from("comments")
      .where("group_id", group.group_id)
      .exec();
    // Convertir chaque document en JSON
    const documentsJson = documents.map((doc) => doc.toJSON());

    // Construire le chemin complet des fichiers
    const basePath = Application.publicPath("uploads");
    const fileData = documents.map((doc) => {
      const filePath = path.join(basePath, doc.file_path);
      return {
        ...doc.toJSON(), // Conserver les autres propriétés du document
        exists: fs.existsSync(filePath),
      };
    });

    return view.render("student.upload", {
      student,
      group,
      members,
      supervisor,
      users,
      infoGroup,
      documents: fileData, // Passer les données des fichiers
      commentData,
    });
  }
  public async upload_file({ view }: HttpContextContract) {
    const credentials = require("../../../memoires-388217-ff7fa116af5e.json");
    // Create an OAuth2 client using the service account credentials

    const auth = new google.auth.GoogleAuth({
      credentials,

      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    // Upload the file to Google Drive
    uploadFileToDrive(
      auth,
      file?.filePath,
      "1mtU6gyJzHY_WG37Hi4XugA4nLuQxJA-w",
      file?.extname as string
    );
    // afficher un message de succes avec sweetalert2
  }
  public async viewComment({ params, response }: HttpContextContract) {
    // Trouver les commentaires associés au document par ID
    const comments = await Comment.query().where("file_id", params.id);

    if (!comments.length) {
      return response.status(404).json({ message: "No comments found" });
    }

    return response.json(comments);
  }
}
