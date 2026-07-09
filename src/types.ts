export type ProjectStatus = 'En développement' | 'Livré' | 'Suspendu' | 'Terminé';
export type ProjectSaleStatus = 'Non payé' | 'Acompte reçu' | 'Payé';
export type MaintenanceFrequency = 'Tous les mois' | 'Tous les 2 mois' | 'Tous les 3 mois' | 'Tous les 6 mois' | 'Chaque année';
export type ContractStatus = 'Actif' | 'Suspendu' | 'Résilié';
export type PaymentType = 'site' | 'maintenance';
export type RelanceStatus = 'Envoyé' | 'En attente' | 'Payé';
export type RelanceChannel = 'WhatsApp' | 'Email' | 'Copie';

export interface Client {
  id?: string;
  nom: string;
  entreprise: string;
  telephone: string;
  whatsapp?: string;
  email: string;
  adresse: string;
  notes: string;
  createdAt: string;
}

export interface Project {
  id?: string;
  clientId: string;
  nom: string;
  description: string;
  typeSite: string; // Vitrine, E-commerce, Portfolio, Blog, etc.
  domaine: string;
  hebergement: string;
  dateDebut: string;
  dateLivraison: string;
  statut: ProjectStatus;
  // Site sale info
  prixSite: number;
  datePaiementSite?: string;
  statutVente: ProjectSaleStatus;
  createdAt: string;
}

export interface Contract {
  id?: string;
  projetId: string;
  clientId: string;
  montant: number; // in FCFA
  frequence: MaintenanceFrequency;
  dateDebut: string;
  prochaineEcheance: string;
  statut: ContractStatus;
  createdAt: string;
}

export interface Payment {
  id?: string;
  clientId: string;
  projetId: string;
  contratId?: string; // empty if site sale payment
  type: PaymentType;
  montant: number;
  datePaiement: string;
  moyenPaiement: string; // e.g. Wave, Orange Money, Virement, Espèces
  reference: string;
  commentaire: string;
  createdAt: string;
}

export interface Relance {
  id?: string;
  clientId: string;
  clientNom: string;
  projetId: string;
  projetNom: string;
  typePaiement: string; // e.g. "Création du site", "Maintenance", "Acompte"
  montant: number;
  lienPaiement: string;
  dateEcheance: string;
  dateEnvoi: string;
  canal: RelanceChannel;
  statut: RelanceStatus;
}
