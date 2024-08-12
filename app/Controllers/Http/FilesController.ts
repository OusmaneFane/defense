import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Document from "App/Models/Document";

export default class FilesController {
  public async filesByDay({ response }: HttpContextContract) {
    const filesByDay = await Database.from("documents")
      .select(Database.raw("DATE(created_at) as date"))
      .count("id as file_count")
      .groupBy("date")
      .orderBy("date", "asc");

    response.json(filesByDay);
  }
}
