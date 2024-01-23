import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Document from "App/Models/Document";
import Database from "@ioc:Adonis/Lucid/Database";

export default class DocumentsController {
  public async store({ request, response, auth }: HttpContextContract) {
    // Récupérer les informations sur le fichier envoyé
    const file = request.file("file");
    console.log("File: ", file);
    if (!file) {
      return "Aucun fichier envoyé";
    }
    const fileName = file.clientName();
    const filePath = `/path/to/save/${fileName}`;
    const fileType = file.type;
    const fileSize = file.size;
    const fileExtension = file.extname;

    // Récupérer l'ID de l'utilisateur et du groupe
    const userId = auth.user?.id;
    // recuperer l'id du groupe de l'utilisateur
    const groupId = await Database.from("group_student")
      .where("student_id", userId)
      .first();

    // Sauvegarder les informations du document dans la base de données
    const document = new Document();
    document.user_id = userId;
    document.group_id = groupId;
    document.fileName = fileName;
    document.filePath = filePath;
    document.fileType = fileType;
    document.fileSize = fileSize;
    document.fileExtension = fileExtension;
    await document.save();

    // Déplacer le fichier vers le répertoire de destination
    await file.move("/path/to/save", {
      name: fileName,
      overwrite: true,
    });

    // Répondre avec la confirmation de succès ou autre réponse appropriée
    return "Fichier enregistré avec succès";
  }
}
