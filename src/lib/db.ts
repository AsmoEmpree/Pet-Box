// src/lib/db.ts - Exemplo de configuração do NeonDB
import { neon } from '@neondatabase/serverless';

// Verifica se a variável de ambiente está configurada
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada. Adicione no .env.local ou nas variáveis de ambiente do Netlify.');
}

// Cria a conexão com o NeonDB
const sql = neon(process.env.DATABASE_URL);

// Exemplo de queries
export async function getUsers() {
  try {
    const users = await sql`SELECT * FROM users`;
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}

export async function createUser(name: string, email: string) {
  try {
    const result = await sql`
      INSERT INTO users (name, email, created_at)
      VALUES (${name}, ${email}, NOW())
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result[0];
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

export async function updateUser(id: string, name: string, email: string) {
  try {
    const result = await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
}

// Exporta a instância do SQL para queries customizadas
export { sql };
