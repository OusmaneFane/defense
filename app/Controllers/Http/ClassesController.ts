import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Classe from "App/Models/Classe";
const axios = require("axios");
import session from "Config/session";
const ExternalApiService = require("../../Services/ExternalApiService");
const apiBaseUrl = "https://api-staging.supmanagement.ml"; // Remplacez par l'URL de l'API externe
const token = "0000-8432-3244-0923";
const schoolYear = "2023-2024";
export default class ClassesController {
  public async index({ view }: HttpContextContract) {
    const externalApiService = new ExternalApiService(apiBaseUrl, token);

    try {
      const allClasses = await externalApiService.getAllClasses(schoolYear);
      console.log(allClasses);

      const classes = await Classe.all();

      return view.render("super_admin.classes.index", {
        classes: classes,
        allClasses,
      });
    } catch (error) {
      console.log(error);
    }
  }
  public async create({ view }: HttpContextContract) {
    return view.render("super_admin.classes.create");
  }

  public async store({ request, response, session }) {
    const data = request.only(["name", "description"]);

    const classe = new Classe();
    classe.name = data.name;
    classe.description = data.description;

    await classe.save();

    session.flash({ success: "Classe créee avec succès" });
    return response.redirect().toRoute("superadmin.manage_classe");
  }

  public async edit({ view, params }: HttpContextContract) {
    const classe = await Classe.findOrFail(params.id);
    return view.render("super_admin.classes.edit", { classe: classe });
  }

  public async update({ request, response, params, session }) {
    //update classe
    const classe = await Classe.findOrFail(params.id);
    classe.merge(request.only(["name", "description"]));
    await classe.save();
    session.flash({ success: "Modification effectuée avec succès" });
    return response.redirect().toRoute("superadmin.manage_classe");
  }
}
