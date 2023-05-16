
import Route from '@ioc:Adonis/Core/Route'


Route.get('/', 'LoginController.index').as('login');
Route.post('/login', 'LoginController.check').as('CheckLogin');


Route.group(() => {
  Route.get('/dashboard', 'AdminsController.dashboard').as('superadmin.dashboard');
  Route.get('/student_dashboard', 'StudentsController.dashboard').as('student.dashboard');
  Route.get('/supervisor_dashboard', 'SupervisorsController.dashboard').as('supervisor.dashboard');

  Route.get('/manage_users', 'AdminsController.manage_users').as('superadmin.manage_users')
  Route.get('/create_user', 'AdminsController.create').as('superadmin.user.create')
  Route.post('/users_store', 'AdminsController.store').as('users.store');
  Route.get('/user/:id/edit', 'AdminsController.edit').as('user.edit')
  Route.post('/user/:id', 'AdminsController.update').as('users.update')
  Route.get('/manage_groups', 'GroupsController.index').as('superadmin.manage_groups')
  Route.get('/create_group', 'GroupsController.create').as('superadmin.create_group')
  // route pour récuperer la classe selectionner
  Route.get('/groups/create/:id', 'GroupsController.view').as('superadmin.create_group_view')

  Route.post('/groups', 'GroupsController.store_group').as('superadmin.groups.store')
  // create classe
  Route.get('/manage_classe', 'ClassesController.index').as('superadmin.manage_classe')
  Route.get('/create_classe', 'ClassesController.create').as('superadmin.create_classe')
  Route.post('/classes', 'ClassesController.store').as('superadmin.classes.store')
  // edit classe
  Route.get('/classe/:id/edit', 'ClassesController.edit').as('classe.edit')
  Route.post('/classe/:id', 'ClassesController.update').as('classe.update')
  //
  Route.get('/student/assignClass/:id', 'StudentsController.showAssignClassForm').as('student.assignClassForm');
  Route.post('student/assign/:classId', 'StudentsController.assignToClass').as('student.assignToClass');


}).middleware('auth')

