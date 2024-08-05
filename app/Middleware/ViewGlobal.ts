import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class ViewGlobal {
  public async handle(
    { view, session }: HttpContextContract,
    next: () => Promise<void>
  ) {
    view.share({ flashMessage: session.flashMessages.all() });

    await next();
  }
}
