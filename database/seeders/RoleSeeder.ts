import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run () {

    const roles = ['super_admin', 'supervisor', 'student']

    await Promise.all(
      roles.map(async (name) => {
        await Role.create({ role_name: name })
      })
    )
  }
}
