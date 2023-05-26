 import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'

export default class MessagesController {

  public async store({ request, response, auth, params }: HttpContextContract) {

    const user = auth.user // Obtenez l'utilisateur connecté

    const groupId =  request.input('group_id') // Obtenez l'ID du groupe à partir des paramètres de la route$
    const content = request.input('content') // Obtenez le contenu du message à partir de la requête

    const message = new Message()
    message.content = content
    message.sender_id = user.id // Utilisez l'ID de l'utilisateur connecté comme senderId
    message.groupId = groupId // Définissez l'ID du groupe auquel le message est destiné
   // console.log('Message: ', message)
    await message.save() // Enregistrez le message dans la base de données


    return response.redirect().back()

  }


}
