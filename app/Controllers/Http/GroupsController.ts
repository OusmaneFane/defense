import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Group from 'App/Models/Group'
import Classe from 'App/Models/Classe'
import Student from 'App/Models/Student'
export default class GroupsController {

  public async index({view}: HttpContextContract){
    const groups = await Group.query().preload('supervisor').preload('students').paginate(1, 10)
    return view.render('super_admin.groups.index', { groups: groups })

  }

  public async create({view}: HttpContextContract){

    const etudiants = await User.query().where('role', 'student').exec()
    const superviseurs = await User.query().where('role', 'supervisor').exec()

    const classes = await Classe.all()
    return view.render('super_admin.groups.create',  { etudiants: etudiants, superviseurs: superviseurs, classes: classes })

  }

  public async store({ request, response }) {
    const data = request.only(['name', 'supervisor', 'students'])

    // Créer un nouveau groupe
    const group = new Group()
    group.name = data.name
    group.supervisorId = data.supervisor

    // Ajouter les étudiants au groupe
    const studentIds = data.students
    console.log(studentIds)
    const students = await User.query().whereIn('id', studentIds).exec()
    console.log(group)
    await group.related('students').attach(students)

    // Sauvegarder le groupe
    await group.save()
    return response.route('groups.index')
  }

  public async store_class({ request, response, params }) {

    // Récupérer l'id de la classe'
    const id = await Classe.findOrFail(params.id)

    // régiriger vers la page de création de groupe
    return response.route('superadmin.create_group_view', { classeId: id })



  }

 public async view({ view, request }: HttpContextContract) {
    // Récupère l'id de la classe
    const classeId = request.input('class_id')

    // Charge la classe correspondante
    const classe = await Classe.findOrFail(classeId)
    // recuperer les etudiants de la classe
    const etudiants = await Student.query().where('class_id', classeId).exec()
    // recuperer tous les superviseurs
    const superviseurs = await User.query().where('role', 'supervisor').exec()


    return view.render('super_admin.groups.create2', { classe,  superviseurs, etudiants })
  }

  public async store_group({ request, response, params }) {

    try {
      // Récupérer les données du formulaire
      const { name, supervisor, studentIds } = request.all()

      // Créer un nouveau groupe
      const group = new Group()
      group.name = name
      group.supervisor_id = supervisor

      // Sauvegarder le groupe en base de données
      await group.save()

      // Attacher les étudiants au groupe
      await group.related('students').attach(studentIds)

      // Rediriger vers la liste des groupes ou une autre page appropriée
      return response.redirect().toRoute('superadmin.manage_groups')
    } catch (error) {
      // Gérer les erreurs
      console.error(error)
      return response.status(500).send('Une erreur est survenue lors de la création du groupe.')
    }

  }

  }




