import { db, auth } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { Client, Project, Contract, Payment, Relance } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to convert Firebase query snapshot to list with IDs
const snapshotToArray = <T>(snapshot: any): T[] => {
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
};

// --- CLIENTS ---
export const getClients = async (): Promise<Client[]> => {
  const colRef = collection(db, 'clients');
  try {
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshotToArray<Client>(snapshot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'clients');
  }
};

export const addClient = async (client: Omit<Client, 'id'>): Promise<string> => {
  const colRef = collection(db, 'clients');
  try {
    const docRef = await addDoc(colRef, client);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'clients');
  }
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<void> => {
  const docRef = doc(db, 'clients', id);
  try {
    await updateDoc(docRef, client);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `clients/${id}`);
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  const docRef = doc(db, 'clients', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
  }
};

// --- PROJECTS ---
export const getProjects = async (): Promise<Project[]> => {
  const colRef = collection(db, 'projects');
  try {
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshotToArray<Project>(snapshot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
};

export const addProject = async (project: Omit<Project, 'id'>): Promise<string> => {
  const colRef = collection(db, 'projects');
  try {
    const docRef = await addDoc(colRef, project);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'projects');
  }
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<void> => {
  const docRef = doc(db, 'projects', id);
  try {
    await updateDoc(docRef, project);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  const docRef = doc(db, 'projects', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
  }
};

// --- CONTRACTS ---
export const getContracts = async (): Promise<Contract[]> => {
  const colRef = collection(db, 'contracts');
  try {
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshotToArray<Contract>(snapshot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'contracts');
  }
};

export const addContract = async (contract: Omit<Contract, 'id'>): Promise<string> => {
  const colRef = collection(db, 'contracts');
  try {
    const docRef = await addDoc(colRef, contract);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'contracts');
  }
};

export const updateContract = async (id: string, contract: Partial<Contract>): Promise<void> => {
  const docRef = doc(db, 'contracts', id);
  try {
    await updateDoc(docRef, contract);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `contracts/${id}`);
  }
};

export const deleteContract = async (id: string): Promise<void> => {
  const docRef = doc(db, 'contracts', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `contracts/${id}`);
  }
};

// --- PAYMENTS ---
export const getPayments = async (): Promise<Payment[]> => {
  const colRef = collection(db, 'payments');
  try {
    const q = query(colRef, orderBy('datePaiement', 'desc'));
    const snapshot = await getDocs(q);
    return snapshotToArray<Payment>(snapshot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'payments');
  }
};

export const addPayment = async (payment: Omit<Payment, 'id'>): Promise<string> => {
  const colRef = collection(db, 'payments');
  try {
    const docRef = await addDoc(colRef, payment);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'payments');
  }
};

export const deletePayment = async (id: string): Promise<void> => {
  const docRef = doc(db, 'payments', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `payments/${id}`);
  }
};

// --- RELANCES ---
export const getRelances = async (): Promise<Relance[]> => {
  const colRef = collection(db, 'relances');
  try {
    const q = query(colRef, orderBy('dateEnvoi', 'desc'));
    const snapshot = await getDocs(q);
    return snapshotToArray<Relance>(snapshot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'relances');
  }
};

export const addRelance = async (relance: Omit<Relance, 'id'>): Promise<string> => {
  const colRef = collection(db, 'relances');
  try {
    const docRef = await addDoc(colRef, relance);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'relances');
  }
};

export const updateRelance = async (id: string, relance: Partial<Relance>): Promise<void> => {
  const docRef = doc(db, 'relances', id);
  try {
    await updateDoc(docRef, relance);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `relances/${id}`);
  }
};

export const deleteRelance = async (id: string): Promise<void> => {
  const docRef = doc(db, 'relances', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `relances/${id}`);
  }
};

// --- AUTO SEED ENGINE ---
export const checkAndSeedData = async (): Promise<boolean> => {
  try {
    const clientsCol = collection(db, 'clients');
    const clientsSnap = await getDocs(clientsCol);
    
    // If we already have clients, don't seed anything
    if (!clientsSnap.empty) {
      return false;
    }

    console.log("Database is empty, running auto-seeding with realistic contracts, projects, and clients...");
    
    const batch = writeBatch(db);

    // 1. Create Clients
    const client1Ref = doc(collection(db, 'clients'));
    const client2Ref = doc(collection(db, 'clients'));
    const client3Ref = doc(collection(db, 'clients'));

    const client1: Client = {
      nom: "Fatou Sylla",
      entreprise: "Sylla Couture & Design",
      telephone: "+221 77 123 45 67",
      whatsapp: "+221 77 123 45 67",
      email: "contact@syllacouture.sn",
      adresse: "Mermoz, Dakar, Sénégal",
      notes: "Créatrice de mode de renom. Préfère les relances par WhatsApp.",
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
    };

    const client2: Client = {
      nom: "Alassane Diop",
      entreprise: "Clinique Baobab",
      telephone: "+221 78 987 65 43",
      whatsapp: "+221 78 987 65 43",
      email: "a.diop@cliniquebaobab.sn",
      adresse: "Almadies, Dakar, Sénégal",
      notes: "Clinique médicale privée. Processus de paiement un peu lent (comptabilité).",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
    };

    const client3: Client = {
      nom: "Seydou Koné",
      entreprise: "Teranga Food & Lodging",
      telephone: "+221 70 543 21 09",
      whatsapp: "+221 70 543 21 09",
      email: "seydou@terangafood.com",
      adresse: "Saly Portudal, Mbour, Sénégal",
      notes: "Chaîne de restaurants et auberges. Très réactif.",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
    };

    batch.set(client1Ref, client1);
    batch.set(client2Ref, client2);
    batch.set(client3Ref, client3);

    // 2. Create Projects
    const project1Ref = doc(collection(db, 'projects'));
    const project2Ref = doc(collection(db, 'projects'));
    const project3Ref = doc(collection(db, 'projects'));

    // Today is 2026-07-09
    const project1: Project = {
      clientId: client1Ref.id,
      nom: "E-Commerce Sylla Fashion",
      description: "Boutique en ligne complète avec catalogue de créateurs et intégration de paiement locale (Wave, Orange Money).",
      typeSite: "E-commerce",
      domaine: "syllacouture.sn",
      hebergement: "Hostinger Cloud",
      dateDebut: "2026-04-15",
      dateLivraison: "2026-06-10",
      statut: "Terminé",
      prixSite: 1200000, // 1.2M FCFA
      datePaiementSite: "2026-06-10",
      statutVente: "Payé",
      createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
    };

    const project2: Project = {
      clientId: client2Ref.id,
      nom: "Portail Clinique Baobab",
      description: "Site vitrine médical complet avec prise de rendez-vous en ligne, présentation de l'équipe et des spécialités.",
      typeSite: "Vitrine",
      domaine: "cliniquebaobab.sn",
      hebergement: "o2switch",
      dateDebut: "2026-05-10",
      dateLivraison: "2026-07-20",
      statut: "En développement",
      prixSite: 850000, // 850k FCFA
      datePaiementSite: "2026-05-12",
      statutVente: "Acompte reçu",
      createdAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString()
    };

    const project3: Project = {
      clientId: client3Ref.id,
      nom: "Site Web Teranga Saly",
      description: "Site internet bilingue pour la promotion des gîtes et de la gastronomie locale de Saly avec système de réservation intégré.",
      typeSite: "Vitrine",
      domaine: "terangasaly.com",
      hebergement: "LWS",
      dateDebut: "2026-05-25",
      dateLivraison: "2026-06-30",
      statut: "Livré",
      prixSite: 650000, // 650k FCFA
      datePaiementSite: "",
      statutVente: "Non payé", // En retard ou en attente
      createdAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString()
    };

    batch.set(project1Ref, project1);
    batch.set(project2Ref, project2);
    batch.set(project3Ref, project3);

    // 3. Create Contracts
    const contract1Ref = doc(collection(db, 'contracts'));
    const contract3Ref = doc(collection(db, 'contracts'));

    // Contract 1: Fashion Store active maintenance
    const contract1: Contract = {
      projetId: project1Ref.id,
      clientId: client1Ref.id,
      montant: 75000, // 75,000 FCFA
      frequence: "Tous les mois",
      dateDebut: "2026-06-15",
      prochaineEcheance: "2026-07-15", // Upcoming in 6 days (Today is July 9)
      statut: "Actif",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Contract 3: Teranga maintenance - Overdue!
    const contract3: Contract = {
      projetId: project3Ref.id,
      clientId: client3Ref.id,
      montant: 120000, // 120,000 FCFA
      frequence: "Tous les 3 mois",
      dateDebut: "2026-06-30",
      prochaineEcheance: "2026-07-01", // Overdue! (Today is July 9)
      statut: "Actif",
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    };

    batch.set(contract1Ref, contract1);
    batch.set(contract3Ref, contract3);

    // 4. Create Payments
    const pay1Ref = doc(collection(db, 'payments'));
    const pay2Ref = doc(collection(db, 'payments'));
    const pay3Ref = doc(collection(db, 'payments'));

    // Project 1 full payment
    const pay1: Payment = {
      clientId: client1Ref.id,
      projetId: project1Ref.id,
      type: "site",
      montant: 1200000,
      datePaiement: "2026-06-10",
      moyenPaiement: "Virement bancaire",
      reference: "VR-2026-9021",
      commentaire: "Règlement final du site e-commerce après livraison.",
      createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Project 2 deposit
    const pay2: Payment = {
      clientId: client2Ref.id,
      projetId: project2Ref.id,
      type: "site",
      montant: 425000, // 50% deposit
      datePaiement: "2026-05-12",
      moyenPaiement: "Wave",
      reference: "WV-887123-Dakar",
      commentaire: "Acompte de 50% au démarrage du projet.",
      createdAt: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000).toISOString()
    };

    // First maintenance payment for Sylla fashion (done at contract debut)
    const pay3: Payment = {
      clientId: client1Ref.id,
      projetId: project1Ref.id,
      contratId: contract1Ref.id,
      type: "maintenance",
      montant: 75000,
      datePaiement: "2026-06-15",
      moyenPaiement: "Wave",
      reference: "WV-991204-Dakar",
      commentaire: "Premier mois de maintenance prépayé.",
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
    };

    batch.set(pay1Ref, pay1);
    batch.set(pay2Ref, pay2);
    batch.set(pay3Ref, pay3);

    // 5. Create Relance history
    const relance1Ref = doc(collection(db, 'relances'));
    const relance1: Relance = {
      clientId: client3Ref.id,
      clientNom: "Seydou Koné",
      projetId: project3Ref.id,
      projetNom: "Site Web Teranga Saly",
      typePaiement: "Maintenance Trimestrielle",
      montant: 120000,
      lienPaiement: "https://pay.wave.com/m/terangasaly",
      dateEcheance: "2026-07-01",
      dateEnvoi: "2026-07-02",
      canal: "WhatsApp",
      statut: "Envoyé"
    };
    batch.set(relance1Ref, relance1);

    await batch.commit();
    console.log("Seeding completed successfully!");
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'checkAndSeedData');
  }
};
