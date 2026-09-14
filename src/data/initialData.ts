import { Account, Category, Transaction, Budget, FinancialGoal } from '../types/finance';

export const INITIAL_ACCOUNTS: Account[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  // Despesas
  {
    id: 'cat_moradia',
    name: 'Moradia & Contas',
    icon: 'Home',
    color: '#3B82F6', // Blue
    type: 'expense',
    subcategories: ['Aluguel / Condomínio', 'Energia Elétrica', 'Água & Gás', 'Internet Fibra', 'Manutenção Casa'],
  },
  {
    id: 'cat_alimentacao',
    name: 'Alimentação & Mercado',
    icon: 'Utensils',
    color: '#F59E0B', // Amber
    type: 'expense',
    subcategories: ['Supermercado', 'Restaurantes & Bares', 'Delivery / iFood', 'Café & Padaria'],
  },
  {
    id: 'cat_transporte',
    name: 'Transporte & Veículo',
    icon: 'Car',
    color: '#6366F1', // Indigo
    type: 'expense',
    subcategories: ['Combustível', 'Uber / 99', 'Seguro & IPVA', 'Estacionamento & Pedágio', 'Manutenção Mecânica'],
  },
  {
    id: 'cat_saude',
    name: 'Saúde & Bem-Estar',
    icon: 'HeartPulse',
    color: '#EC4899', // Pink
    type: 'expense',
    subcategories: ['Farmácia', 'Plano de Saúde', 'Consultas & Exames', 'Academia & Suplementos'],
  },
  {
    id: 'cat_lazer',
    name: 'Lazer & Streaming',
    icon: 'Tv',
    color: '#8B5CF6', // Purple
    type: 'expense',
    subcategories: ['Cinema & Eventos', 'Streaming (Netflix, Spotify)', 'Viagens', 'Hobbies & Games'],
  },
  {
    id: 'cat_educacao',
    name: 'Educação & Livros',
    icon: 'GraduationCap',
    color: '#14B8A6', // Teal
    type: 'expense',
    subcategories: ['Cursos & Certificações', 'Faculdade / Pós', 'Livros', 'Assinaturas Educacionais'],
  },
  {
    id: 'cat_compras',
    name: 'Compras Pessoais',
    icon: 'ShoppingBag',
    color: '#F43F5E', // Rose
    type: 'expense',
    subcategories: ['Roupas & Calçados', 'Eletrônicos & Tech', 'Cuidados Pessoais', 'Presentes'],
  },
  // Receitas
  {
    id: 'cat_salario',
    name: 'Salário & Remuneração',
    icon: 'Briefcase',
    color: '#00D2B5', // TradeMap Cyan
    type: 'income',
    subcategories: ['Salário CLT', 'Pró-labore', 'Bônus / PLR', '13º Salário'],
  },
  {
    id: 'cat_freelance',
    name: 'Freelance & Consultoria',
    icon: 'Laptop',
    color: '#10B981', // Emerald
    type: 'income',
    subcategories: ['Projetos Dev / Design', 'Consultoria Financeira', 'Aulas / Palestras'],
  },
  {
    id: 'cat_rendimentos',
    name: 'Dividendos & Rendimentos',
    icon: 'PiggyBank',
    color: '#06B6D4', // Cyan
    type: 'income',
    subcategories: ['Dividendos Ações/FIIs', 'Rendimento CDI / Tesouro', 'Aluguel Recebido'],
  },
  // Investimento
  {
    id: 'cat_investimentos',
    name: 'Aportes & Investimentos',
    icon: 'TrendingUp',
    color: '#00E5AA', // TradeMap vibrant neon
    type: 'both',
    subcategories: ['Ações & B3', 'Fundos Imobiliários', 'Tesouro Direto / Renda Fixa', 'Criptoativos', 'Reserva Emergência'],
  },
  {
    id: 'cat_outros',
    name: 'Outros & Ajustes',
    icon: 'MoreHorizontal',
    color: '#64748B',
    type: 'both',
    subcategories: ['Estorno', 'Empréstimo', 'Reembolso', 'Diversos'],
  },
];

// Completely clean starting state for real user data
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BUDGETS: Budget[] = [];
export const INITIAL_GOALS: FinancialGoal[] = [];
