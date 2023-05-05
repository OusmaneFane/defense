/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

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

}).middleware('auth')

