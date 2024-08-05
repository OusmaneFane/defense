import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Document from 'App/Models/Document'
const Helpers = use('Helpers')

export default class FilesController {

  public async download({ response, params }) {
    const { filename } = params
    const filePath = `uploads/${filename}`

    return response.download(Helpers.publicPath(filePath))
  }
  }



