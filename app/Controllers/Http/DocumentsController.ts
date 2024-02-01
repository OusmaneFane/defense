import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Document from "App/Models/Document";
import Database from "@ioc:Adonis/Lucid/Database";
import Student from "App/Models/Student";
const { google } = require("googleapis");
const fs = require("fs");
import Application from "@ioc:Adonis/Core/Application";

async function uploadFileToDrive(auth, groupId, filePath) {
  const drive = google.drive({ version: "v3", auth });

  // Vérifier si le dossier pour le groupe existe déjà
  const folderName = `Groupe_${groupId}`;
  let folderId;
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const response = await drive.files.list({ q: query });
  if (response.data.files.length === 0) {
    // Créer le dossier s'il n'existe pas
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });
    folderId = folder.data.id;
  } else {
    folderId = response.data.files[0].id;
  }

  // Upload du fichier dans le dossier correspondant au groupe
  const fileMetadata = {
    name: "Nom_du_fichier", // Remplacez par le nom du fichier
    parents: [folderId],
  };
  const media = {
    mimeType: "application/pdf", // Remplacez par le type MIME du fichier
    body: fs.createReadStream(filePath),
  };
  const res = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });
  console.log("Fichier uploadé avec succès. ID : ", res.data.id);
}
export default class DocumentsController {
  public async store({
    request,
    session,
    auth,
    response,
  }: HttpContextContract) {
    // Récupérer les informations sur le fichier envoyé
    const file = request.file("file");

    if (file) {
      const fileName = file.clientName;
      const filePath = file.tmpPath;
      const fileType = file.type;
      const fileSize = file.size;
      const fileExtension = file.extname;
      console.log("fileName", fileName);
      console.log("filePath", filePath);
      console.log("fileType", fileType);
      console.log("fileSize", fileSize);
      console.log("fileSize", fileSize);
      console.log("fileExtension", fileExtension);

      // Récupérer l'ID de l'utilisateur et du groupe
      const userId = auth.user?.id;
      console.log("userId", userId);
      const student = await Student.findByOrFail("email", auth.user?.email);
      const groupId = await Database.from("group_student")
        .where("student_id", student.id)
        .first();

      console.log("groupId", groupId.group_id);
      // Sauvegarder les informations du document dans la base de données
      const document = new Document();
      document.user_id = userId;
      document.group_id = groupId.group_id;
      document.file_name = fileName;
      document.file_path = filePath;
      document.file_type = fileType;
      document.file_size = fileSize;
      document.file_extension = fileExtension;
      await document.save();
      console.log("création document");

      // Déplacer le fichier vers le répertoire public dans uploads sous son nom
      const data = await file.move(Application.publicPath("uploads"));

      console.log("fichier uploadé avec succès");
      session.flash({ success: "Classe créee avec succès" });
      return response.redirect().back();
    }
    //sinon
    else {
      session.flash({
        error: "Une erreur est survenue lors de l'envoi du fichier.",
      });
      return response.redirect().back();
    }
  }
}
