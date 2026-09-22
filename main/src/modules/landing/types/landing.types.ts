export interface ContactFormData {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  interesse: string;
  /** Modelo Ford real de interesse — é o que vira Lead.veiculoInteresse no
   * backend (antes o campo "interesse" genérico ia pra lá por engano). */
  veiculo: string;
  mensagem: string;
}

export interface ContactFormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  interesse?: string;
  veiculo?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface TechCard {
  icon: string;
  title: string;
  description: string;
  barWidth: number;
  barLabel: string;
}

export interface BenefitCard {
  num: string;
  icon: string;
  title: string;
  description: string;
  accent?: boolean;
}

export interface Vehicle {
  image: string;
  alt: string;
  badge: string;
  badgeType?: 'default' | 'electric';
  name: string;
  category: string;
  featured?: boolean;
}
