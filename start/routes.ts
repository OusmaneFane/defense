import Route from "@ioc:Adonis/Core/Route";

Route.get("/", "LoginController.index").as("login");
Route.post("/login", "LoginController.check").as("CheckLogin");
Route.get("/logout", "LoginController.logout").as("logout");

Route.group(() => {
  Route.get("/dashboard", "AdminsController.dashboard").as(
    "superadmin.dashboard"
  );
  Route.get("/student_dashboard", "StudentsController.dashboard").as(
    "student.dashboard"
  );
  Route.get("/upload-files", "StudentsController.upload").as(
    "student.upload_file"
  );
  Route.get("/student/view-comment/:id", "StudentsController.viewComment").as(
    "student.view-comment"
  );

  Route.get("/supervisor_dashboard", "SupervisorsController.dashboard").as(
    "supervisor.dashboard"
  );
  Route.get("/view-files", "SupervisorsController.viewFile").as(
    "supervisor.view_file"
  );
  Route.get("/supervisor/groups", "SupervisorsController.groups").as(
    "supervisor.groups"
  );

  Route.get("/manage_users", "AdminsController.manage_users").as(
    "superadmin.manage_users"
  );
  Route.get("/create_user", "AdminsController.create").as(
    "superadmin.user.create"
  );
  Route.post("/users_store", "AdminsController.store").as("users.store");
  Route.get("/user/:id/edit", "AdminsController.edit").as("user.edit");
  Route.get("/user/:id/profil", "AdminsController.profil").as("user.profil");

  Route.post("/user/:id", "AdminsController.update").as("users.update");
  Route.get("/manage_groups", "GroupsController.index").as(
    "superadmin.manage_groups"
  );
  Route.get("/create_group", "GroupsController.create").as(
    "superadmin.create_group"
  );
  // route pour récuperer la classe selectionner
  // Route.get('/groups/create/:id', 'GroupsController.view').as('superadmin.create_group_view')
  Route.get("/create-group-view", "GroupsController.view").as(
    "superadmin.create_group_view"
  );

  Route.post("/groups", "GroupsController.store_group").as(
    "superadmin.groups.store"
  );
  Route.get("/groups/:id", "GroupsController.show").as("groups.show");
  Route.get("/groups/:id/chats", "GroupsController.showGroupChat").as(
    "groups.showChats"
  );
  Route.get("/groups/:id/documents", "GroupsController.showDocuments").as(
    "groups.showDocuments"
  );

  // create classe
  Route.get("/manage_classe", "ClassesController.index").as(
    "superadmin.manage_classe"
  );
  Route.get("/create_classe", "ClassesController.create").as(
    "superadmin.create_classe"
  );
  Route.post("/classes", "ClassesController.store").as(
    "superadmin.classes.store"
  );
  // edit classe
  Route.get("/classe/:id/edit", "ClassesController.edit").as("classe.edit");
  Route.post("/classe/:id", "ClassesController.update").as("classe.update");
  //
  Route.get(
    "/student/assignClass/:id",
    "StudentsController.showAssignClassForm"
  ).as("student.assignClassForm");
  Route.post("student/assign/:classId", "StudentsController.assignToClass").as(
    "student.assignToClass"
  );

  // route pour les messages
  Route.post("/messages", "MessagesController.store").as("messages.store");
  // uploads files
  Route.post("/upload", "DocumentsController.store").as("uploads.store");
  // route pour les documents
  Route.get("/documents", "AdminsController.document_index").as(
    "manage_documents"
  );
  // route pour telecharger les documents
  Route.get("uploads/:filename", async ({ response, params }) => {
    const filePath = `uploads/${params.filename}`;
    return response.download(Helpers.publicPath(filePath));
  }).as("file.download");
  Route.get("/comment/:id", "DocumentsController.comment_file").as(
    "comments.file"
  );
  Route.get("/comment/:id/edit", "DocumentsController.edit").as(
    "comments.edit"
  );
  Route.post("/comment/:id", "DocumentsController.update").as(
    "comments.update"
  );
  Route.post("/store/comment", "DocumentsController.store_comment").as(
    "store.comments"
  );
  Route.get("groups/download/:groupName", "DocumentsController.downloadZip").as(
    "groups.download"
  );
  Route.get("/users/:id/block", "UsersController.block").as("users.block");
  Route.get("/users/:id/unblock", "UsersController.unblock").as(
    "users.unblock"
  );
  // start/routes.js
  // start/routes.js

  Route.get("/api/files-by-day", "FilesController.filesByDay");
}).middleware("auth");
