import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  users,
  partners,
  projects,
  referrals,
  tickets,
  payments,
  portfolio,
  notifications,
  projectMessages,
  projectFiles,
  projectTimeline,
  ticketResponses,
  paymentMethods,
  invoices,
  transactions,
  paymentStages,
  budgetNegotiations,
  twilioConfig,
  workModalities,
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Log para verificar la conexión a la base de datos
console.log('🔗 Conectando a la base de datos...');
console.log('📊 Database URL configurada:', process.env.DATABASE_URL ? 'SÍ' : 'NO');
console.log('🌐 Host de la DB:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'No detectado');

// Define el objeto schema con todas las tablas
const schema = {
  users,
  partners,
  projects,
  referrals,
  tickets,
  payments,
  portfolio,
  notifications,
  projectMessages,
  projectFiles,
  projectTimeline,
  ticketResponses,
  paymentMethods,
  invoices,
  transactions,
  paymentStages,
  budgetNegotiations,
  twilioConfig,
  workModalities,
};

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export all tables from the schema for easy access
export { 
  users, 
  partners, 
  projects, 
  referrals, 
  tickets, 
  payments, 
  portfolio, 
  notifications, 
  projectMessages, 
  projectFiles, 
  projectTimeline, 
  ticketResponses, 
  paymentMethods, 
  invoices, 
  transactions, 
  paymentStages, 
  budgetNegotiations, 
  twilioConfig,
  workModalities,
};