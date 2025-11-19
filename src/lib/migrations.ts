// Script de migração para criar tabelas iniciais no Neon Database
import { sql } from './neondb';

export async function runMigrations() {
  console.log('🚀 Iniciando migrações do banco de dados...');

  try {
    // Criar tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela "users" criada/verificada');

    // Criar índice no email
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;
    console.log('✅ Índice "idx_users_email" criado/verificado');

    // Criar tabela de produtos
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela "products" criada/verificada');

    // Criar índice no preço
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)
    `;
    console.log('✅ Índice "idx_products_price" criado/verificado');

    // Criar tabela de pedidos
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela "orders" criada/verificada');

    // Criar índice no user_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
    `;
    console.log('✅ Índice "idx_orders_user_id" criado/verificado');

    // Criar tabela de itens do pedido
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela "order_items" criada/verificada');

    // Criar tabela de contas (para exemplo de transações)
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabela "accounts" criada/verificada');

    // Criar função para atualizar updated_at automaticamente
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log('✅ Função "update_updated_at_column" criada/verificada');

    // Criar triggers para atualizar updated_at
    await sql`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('✅ Trigger "update_users_updated_at" criado/verificado');

    await sql`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('✅ Trigger "update_products_updated_at" criado/verificado');

    await sql`
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('✅ Trigger "update_orders_updated_at" criado/verificado');

    await sql`
      DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
      CREATE TRIGGER update_accounts_updated_at
        BEFORE UPDATE ON accounts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('✅ Trigger "update_accounts_updated_at" criado/verificado');

    console.log('🎉 Todas as migrações foram executadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Função para inserir dados de exemplo (opcional)
export async function seedDatabase() {
  console.log('🌱 Inserindo dados de exemplo...');

  try {
    // Inserir usuários de exemplo
    const users = await sql`
      INSERT INTO users (name, email)
      VALUES 
        ('João Silva', 'joao@example.com'),
        ('Maria Santos', 'maria@example.com'),
        ('Pedro Oliveira', 'pedro@example.com')
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `;
    console.log(`✅ ${users.length} usuários inseridos`);

    // Inserir produtos de exemplo
    const products = await sql`
      INSERT INTO products (name, price, description, stock)
      VALUES 
        ('Produto 1', 99.90, 'Descrição do produto 1', 10),
        ('Produto 2', 149.90, 'Descrição do produto 2', 5),
        ('Produto 3', 199.90, 'Descrição do produto 3', 8)
      RETURNING *
    `;
    console.log(`✅ ${products.length} produtos inseridos`);

    console.log('🎉 Dados de exemplo inseridos com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
    throw error;
  }
}

// Executar migrações se este arquivo for executado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Script de migração concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script de migração:', error);
      process.exit(1);
    });
}
