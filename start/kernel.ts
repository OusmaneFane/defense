import Server from "@ioc:Adonis/Core/Server";
import CheckUserRole from "App/Middleware/CheckUserRole";
import GlobalMiddleware from "App/Middleware/ViewGlobal";

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| An array of global middleware, that will be executed in the order they
| are defined for every HTTP requests.
|
*/
Server.middleware.register([
  () => import("@ioc:Adonis/Core/BodyParser"),
  () => import("App/Middleware/LogRequest"),
]);
const globalMiddleware = [
  // ...
  "Adonis/Core/BodyParserMiddleware",
  "Adonis/Core/SessionMiddleware",
  GlobalMiddleware, // Ajout du middleware ViewGlobal
];

Server.middleware.registerNamed({
  auth: () => import("App/Middleware/Auth"),
});
export { globalMiddleware };
