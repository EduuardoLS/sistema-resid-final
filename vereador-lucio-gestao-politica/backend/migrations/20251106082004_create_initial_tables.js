exports.up = function(knex) {
  return knex.schema
    // --- 0. CRIAR OS ENUMS (Tipos do Postgres) ---
    // Isso garante que só entrem valores válidos
    .raw(`
      DO $$ BEGIN
        CREATE TYPE status_acao AS ENUM ('planejada', 'em_andamento', 'concluida', 'cancelada');
        CREATE TYPE status_tarefa AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada');
        CREATE TYPE tipo_financeiro AS ENUM ('entrada', 'saida', 'investimento');
        CREATE TYPE tipo_permissao AS ENUM ('admin', 'usuario', 'gestor');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // --- 1. ESTRUTURA GEOGRÁFICA (Base do Mapa) ---
    .createTable('municipios', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('nome', 255).notNullable();
    })
    .createTable('bairros', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('nome', 255).notNullable();
      table.string('cidade', 255);
      table.string('municipio_ibge_id', 10);
      table.decimal('latitude', 10, 7); // Importante para o mapa
      table.decimal('longitude', 10, 7);
      table.timestamps(true, true);
    })

    // --- 2. USUÁRIOS (Profiles) ---
    .createTable('Profiles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      // No dump você tem 'role' E 'permissoes'. Sugiro manter o enum nativo:
      table.specificType('permissoes', 'tipo_permissao').defaultTo('usuario');
      table.string('role', 50).defaultTo('user'); 
      table.timestamps(true, true);
    })
    
    // --- 3. LOGS DE ACESSO (Segurança) ---
    .createTable('user_access_logs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id'); // Pode ser FK para Profiles
      table.string('action').notNullable();
      table.string('ip_address');
      table.string('user_agent');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // --- 4. CONTATOS (Base completa do Dump) ---
    .createTable('contatos', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('nome_completo');
      table.string('email');
      table.string('celular');
      table.string('telefone');
      
      // Dados Pessoais
      table.date('data_nascimento');
      table.string('idade'); // No dump está como texto
      table.string('sexo');
      table.string('escolaridade');
      
      // Endereço
      table.string('endereco');
      table.string('cep', 20);
      table.string('bairro'); // Idealmente viraria FK para tabela 'bairros' futuramente
      table.string('cidade');
      table.string('estado', 2);
      
      // Gestão
      table.string('tag_equipe');
      table.string('assessor_parlamentar');
      table.text('assunto');
      table.text('observacao');
      
      // Geolocalização
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      
      table.uuid('profile_id'); // Quem cadastrou
      table.uuid('user_id');    // Redundante no dump, mas mantendo compatibilidade
      table.timestamps(true, true);
    })

    // --- 5. INTELIGÊNCIA ELEITORAL (Faltava tudo isso) ---
    .createTable('eleicoes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.integer('ano').notNullable();
      table.string('cidade').notNullable();
      table.string('estado', 2).notNullable();
      table.integer('total_votos_validos');
      table.timestamps(true, true);
    })
    .createTable('locais_votacao', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('nome').notNullable(); // Ex: Escola Farolandia
      table.string('endereco');
      table.string('bairro');
      table.uuid('zona_id'); // Se tiver tabela de zonas
    })
    .createTable('secoes_eleitorais', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('local_votacao_id').references('id').inTable('locais_votacao');
      table.integer('numero_secao').notNullable();
      table.integer('quantidade_eleitores');
    })
    .createTable('resultados_eleitorais', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('eleicao_id').references('id').inTable('eleicoes');
      table.uuid('local_votacao_id').references('id').inTable('locais_votacao');
      table.integer('quantidade_votos').defaultTo(0);
    })

    // --- 6. TAREFAS E AÇÕES ---
    .createTable('tarefas', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('titulo');
      table.text('descricao');
      table.specificType('status', 'status_tarefa').defaultTo('pendente');
      table.string('priority');
      table.string('responsible');
      table.date('data_prazo'); // Unificando due_date e data
      table.uuid('user_id');
      table.uuid('contato_id');
      table.timestamps(true, true);
    })
    .createTable('acoes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('titulo').notNullable();
      table.text('descricao');
      table.string('tipo');
      table.specificType('status', 'status_acao').defaultTo('planejada');
      table.date('data');
      table.string('local');
      table.decimal('latitude', 10, 7);
      table.decimal('longitude', 10, 7);
      table.uuid('profile_id');
      table.timestamps(true, true);
    })

    // --- 7. FINANCEIRO DETALHADO ---
    .createTable('registros_financeiros', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.specificType('tipo', 'tipo_financeiro');
      table.string('descricao');
      table.decimal('valor', 15, 2);
      table.date('data');
      
      // Detalhamento específico do seu dump
      table.decimal('valor_combustivel', 10, 2);
      table.decimal('valor_locacao_imovel', 10, 2);
      table.decimal('valor_assessoria_juridica', 10, 2);
      table.decimal('valor_assessoria_comunicacao', 10, 2);
      
      table.uuid('user_id');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  // Drop em ordem reversa para respeitar as chaves estrangeiras
  return knex.schema
    .dropTableIfExists('resultados_eleitorais')
    .dropTableIfExists('secoes_eleitorais')
    .dropTableIfExists('locais_votacao')
    .dropTableIfExists('eleicoes')
    .dropTableIfExists('registros_financeiros')
    .dropTableIfExists('acoes')
    .dropTableIfExists('tarefas')
    .dropTableIfExists('contatos')
    .dropTableIfExists('user_access_logs')
    .dropTableIfExists('Profiles')
    .dropTableIfExists('bairros')
    .dropTableIfExists('municipios')
    .raw('DROP TYPE IF EXISTS status_acao')
    .raw('DROP TYPE IF EXISTS status_tarefa')
    .raw('DROP TYPE IF EXISTS tipo_financeiro')
    .raw('DROP TYPE IF EXISTS tipo_permissao');
};