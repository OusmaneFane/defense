import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Document from "App/Models/Document";
import Database from "@ioc:Adonis/Lucid/Database";
import Student from "App/Models/Student";
const { google } = require("googleapis");
const path = require("path");
import Application from "@ioc:Adonis/Core/Application";
import { file } from "googleapis/build/src/apis/file";
import Comment from "App/Models/Comment";
import archiver from "archiver"; // Notez l'importation correcte
import { createWriteStream } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { promises as fs } from "fs";
import Group from "App/Models/Group";
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
    try {
      // Vérifier si un fichier a été envoyé
      const fileUploaded = request.file("document", {
        extnames: ["pdf"],
        size: "10mb",
      });

      console.log("File Uploaded:", fileUploaded);

      if (fileUploaded) {
        const fileName = fileUploaded.clientName;
        const fileExtension = fileUploaded.extname;

        // Récupérer l'ID de l'utilisateur et du groupe
        const userId = auth.user?.id;
        const student = await Student.findByOrFail("email", auth.user?.email);
        const groupIdRow = await Database.from("group_student")
          .where("student_id", student.id)
          .first();

        if (!groupIdRow) {
          throw new Error("Group ID not found for the student");
        }

        // Supposons que groupIdRow.group_id est un ID numérique, récupérer le nom du groupe
        const groupId = String(groupIdRow.group_id);
        const groupNameRow = await Database.from("groups") // Remplacez 'groups' par le nom de votre table
          .where("id", groupId)
          .first();

        if (!groupNameRow) {
          throw new Error("Group name not found for the group ID");
        }

        const groupName = groupNameRow.name; // Remplacez 'name' par la colonne contenant le nom du groupe

        // Créer le chemin du répertoire du groupe
        const groupFolderPath = path.join(
          Application.publicPath("uploads"),
          groupName
        );

        // Vérifier si le répertoire du groupe existe, sinon le créer
        if (!fs.existsSync(groupFolderPath)) {
          console.log(
            `Répertoire n'existe pas. Création du répertoire : ${groupFolderPath}`
          );
          fs.mkdirSync(groupFolderPath, { recursive: true });
        } else {
          console.log(`Répertoire existe déjà : ${groupFolderPath}`);
        }

        // Déplacer le fichier vers le répertoire du groupe
        const data = await fileUploaded.move(groupFolderPath, {
          name: fileName,
          overwrite: true,
        });

        if (data?.error) {
          console.error("Erreur lors du déplacement du fichier", data.error);
          session.flash({
            error: "Une erreur est survenue lors de l'envoi du fichier.",
          });
          return response.redirect().back();
        }

        // Sauvegarder les informations du document dans la base de données
        const document = new Document();
        document.user_id = userId;
        document.group_id = groupId; // Utiliser le nom du groupe plutôt que l'ID
        document.file_name = fileName;
        document.file_path = path.join(groupName, fileName); // Chemin relatif
        document.file_type = fileUploaded.type;
        document.file_size = fileUploaded.size;
        document.file_extension = fileExtension;
        await document.save();
        console.log("Création document");

        session.flash({ fileUploaded: "Fichier uploadé avec succès" });
        return response.redirect().back();
      } else {
        console.error("Aucun fichier n'a été envoyé.");
        session.flash({
          error: "Aucun fichier n'a été envoyé.",
        });
        return response.redirect().back();
      }
    } catch (error) {
      console.error("Erreur dans la méthode store", error);
      session.flash({
        error: "Une erreur est survenue lors du traitement du fichier.",
      });
      return response.redirect().back();
    }
  }
  public async comment_file({
    view,
    auth,
    params,
    request,
  }: HttpContextContract) {
    await auth.use("web").authenticate();

    const documentInfo = await Document.findOrFail(params.id);

    const groupInfo = await Database.from("documents")
      .where("id", params.id)
      .first();
    console.log("groupInfo: ", groupInfo.id);
    const group = await Group.query()
      .where("id", groupInfo.group_id)
      .preload("supervisor")
      .firstOrFail();

    return view.render("supervisor.comments.index", {
      documentInfo,
      group,
      currentRoute: request.url(),
    });
  }
  public async store_comment({
    response,
    request,
    session,
  }: HttpContextContract) {
    const data = request.only([
      "fileId",
      "fileName",
      "groupId",
      "supervisorId",
      "content",
    ]);

    // Créer un nouveau commentaire
    const commentData = new Comment();
    commentData.file_id = data.fileId;
    commentData.group_id = data.groupId;
    commentData.supervisor_id = data.supervisorId;
    commentData.content = data.content;

    // Enregistrer le commentaire dans la base de données
    await commentData.save();
    session.flash({ success: "Commentaire effectué avec succèss" });

    return response.redirect().toRoute("supervisor.dashboard");
  }

  public async edit({ params, view, request }: HttpContextContract) {
    console.log(params.id);

    const comment = await Comment.findOrFail(params.id);

    return view.render("supervisor.comments.edit", {
      comment,
      currentRoute: request.url(),
    });
  }
  public async update({
    params,
    request,
    response,
    session,
  }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.id);
    if (!comment) {
      return response.status(404).send("Comment not found");
    }

    // Récupérer le contenu du commentaire à partir de la requête
    const content = request.input("content");

    // Mettre à jour le commentaire
    comment.content = content;
    await comment.save();

    // Ajouter un message de succès à la session
    session.flash({ EditComment: "Commentaire mis à jour avec succès!" });

    // Rediriger vers une autre page (par exemple, la liste des documents)
    return response.redirect().toRoute("supervisor.dashboard");
  }
  public async downloadZip({ params, response }: HttpContextContract) {
    const groupName = params.groupName as string;
    const directoryPath = join(__dirname, "../../../public/uploads", groupName);
    const zipFileName = `${groupName}.zip`;

    console.log(`Starting the ZIP process for group: ${groupName}`);
    console.log(`Directory to be zipped: ${directoryPath}`);

    // Vérifiez si le répertoire existe
    try {
      console.log(`Checking access to directory: ${directoryPath}`);
      await fs.access(directoryPath);
      console.log(`Directory exists: ${directoryPath}`);
    } catch (err) {
      console.error("Directory not found:", directoryPath);
      return response.status(404).send("Directory not found");
    }

    response.header(
      "Content-Disposition",
      `attachment; filename=${zipFileName}`
    );
    response.type("application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("Archiver error:", err.message);
      response.status(500).send(err.message);
    });

    response.implicitEnd = false; // Disable automatic response end
    archive.pipe(response.response); // Pipe the archive to the response

    console.log("Adding directory to ZIP archive...");
    archive.directory(directoryPath, false);

    try {
      await archive.finalize();
      console.log("Archive finalized successfully");
    } catch (err) {
      console.error("Error finalizing the archive:", err.message);
      response.status(500).send("Error creating archive");
    }
  }
}
