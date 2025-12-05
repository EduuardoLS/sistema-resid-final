const bcrypt = require('bcryptjs'); // Se der erro, mude para require('bcrypt')

exports.seed = async function(knex) {
  // 1. Gera a senha criptografada
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  // 2. Verifica se o admin já existe na tabela 'Profiles'
  const adminExists = await knex('Profiles').where({ email: 'admin@resid.com' }).first();

  if (!adminExists) {
      // 3. Insere na tabela 'Profiles' respeitando suas colunas
      await knex('Profiles').insert([
        {
          first_name: 'Super',
          last_name: 'Admin',
          email: 'admin@resid.com',
          password: hashedPassword,
          permissoes: 'admin', // Assumindo que 'admin' é um valor válido no seu enum
          role: 'admin'
        }
      ]);
      console.log('✅ Usuário Admin criado na tabela Profiles com sucesso!');
  } else {
      console.log('⚠️ Usuário Admin já existe.');
  }
};