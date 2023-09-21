 import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import Document from 'App/Models/Document'
import { google } from 'googleapis'
import fs from 'fs'
const path = require('path')
const mime = require('mime')
import Ws from 'App/Services/Ws'


// Function to upload a file to Google Drive
async function uploadFileToDrive(auth, filePath, folderId, mimeType) {
  const drive = google.drive({ version: 'v3', auth });

  const fileName = path.basename(filePath);

  const media = {
    mimeType: "application/"+mimeType,
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
      fields: 'id',
    });

    console.log('File uploaded. File ID:', response.data.id);
  } catch (error) {
    console.error('Error uploading file:', error.message);
  }
}

export default class MessagesController {

  public async store({ request, response, auth, params, session }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      return response.redirect().back()
    }

    const groupId = request.input('group_id')
    const content = request.input('content')
    const file = request.file('file')
    console.log(file)
    const message = new Message()
    if(!content){
      message.content = file.clientName
    }else{
      message.content = content
    }

    message.sender_id = user.id
    message.groupId = groupId
    await message.save()



    //verifier si file est nul

      // if(!file){
      //   session.flash({ success: 'Message enregistré avec succès' });
      //   Ws.io.emit('new:message:*', "New message")


    if (file) {
      const fileName = file.clientName
      const filePath = `/public/uploads/${fileName}`
      const fileType = file.type
      const fileSize = file.size
      const fileExtension = file.extname.replace('.', '')
      const mimeType = file.extname.replace('.', '')

      const document = new Document()
      document.user_id = user.id
      document.group_id = groupId
      document.file_name = fileName
      document.file_path = filePath
      document.file_type = mimeType
      document.file_size = fileSize
      document.file_extension = fileExtension
      await document.save()

      // Associer l'ID du document au message
      message.document_id = document.id
      await message.save()

      await file.move('./public/uploads', {
        name: fileName,
      });

      const credentials = require('../../../soutenances-2a7aa06b396c.json');
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      uploadFileToDrive(auth, file.filePath, "1BXTloxe3jLAD3pYa9lct6_u9QtwV-QPM", file.extname as string);

      session.flash({ success: 'Courrier enregistré avec succès' });
    }

    Ws.io.emit('new:message:*', "New message")
    return response.redirect().back();


  }



}
