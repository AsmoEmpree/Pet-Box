// Configuração do cliente Neon Database
import { neon, neonConfig } from '@neondatabase/serverless';

// Habilitar cache de conexões para melhor performance
neonConfig.fetchConnectionCache = true;

// Criar cliente SQL
const sql = neon(process.env.DATABASE_URL!);

// Verificar se a conexão está configurada
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 20);
}

// Exemplo de queries básicas
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Conexão com Neon Database estabelecida:', result[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Neon Database:', error);
    return false;
  }
}

// Exemplo: Buscar todos os usuários
export async function getUsers() {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}

// Exemplo: Buscar usuário por ID
export async function getUserById(id: number) {
  try {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

// Exemplo: Criar novo usuário
export async function createUser(name: string, email: string) {
  try {
    const result = await sql`
      INSERT INTO users (name, email)
      VALUES (${name}, ${email})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

// Exemplo: Atualizar usuário
export async function updateUser(id: number, name: string, email: string) {
  try {
    const result = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

// Exemplo: Deletar usuário
export async function deleteUser(id: number) {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
}

// Exemplo: Buscar produtos
export async function getProducts() {
  try {
    const products = await sql`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `;
    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
}

// Exemplo: Criar produto
export async function createProduct(name: string, price: number, description?: string) {
  try {
    const result = await sql`
      INSERT INTO products (name, price, description)
      VALUES (${name}, ${price}, ${description || ''})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
}

// Exemplo: Buscar produtos com filtro de preço
export async function getProductsByPriceRange(minPrice: number, maxPrice: number) {
  try {
    const products = await sql`
      SELECT * FROM products 
      WHERE price BETWEEN ${minPrice} AND ${maxPrice}
      ORDER BY price ASC
    `;
    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos por preço:', error);
    throw error;
  }
}

// Exemplo: Transação (transferência de fundos)
export async function transferFunds(fromAccountId: number, toAccountId: number, amount: number) {
  try {
    await sql`BEGIN`;
    
    // Debitar da conta origem
    await sql`
      UPDATE accounts 
      SET balance = balance - ${amount} 
      WHERE id = ${fromAccountId}
    `;
    
    // Creditar na conta destino
    await sql`
      UPDATE accounts 
      SET balance = balance + ${amount} 
      WHERE id = ${toAccountId}
    `;
    
    await sql`COMMIT`;
    return true;
  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Erro na transferência:', error);
    throw error;
  }
}

// Exportar cliente SQL para uso direto quando necessário
export { sql };
