import React, { useState, useEffect } from 'react';
import { 
  Client, 
  Project, 
  Contract, 
  Payment, 
  Relance, 
  MaintenanceFrequency, 
  PaymentType, 
  ProjectStatus, 
  ProjectSaleStatus, 
  ContractStatus 
} from './types';
import { 
  getClients, addClient, updateClient, deleteClient,
  getProjects, addProject, updateProject, deleteProject,
  getContracts, addContract, updateContract, deleteContract,
  getPayments, addPayment, deletePayment,
  getRelances, addRelance, updateRelance, deleteRelance,
  checkAndSeedData
} from './services/db';

// Component imports
import Dashboard from './components/Dashboard';
import ClientsList from './components/ClientsList';
import ProjectsList from './components/ProjectsList';
import ContractsList from './components/ContractsList';
import PaymentsList from './components/PaymentsList';
import RelancesList from './components/RelancesList';
import CalendarView from './components/CalendarView';
import ReportsView from './components/ReportsView';

// Icon imports
import { 
  LayoutDashboard, Users, FolderKanban, ShieldCheck, 
  Coins, BellRing, CalendarRange, BarChart3, ShieldAlert,
  Menu, X, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { registerNotifications } from './lib/notification';

// Date utility to calculate next due date
const calculateNextDueDate = (currentDueDateStr: string, frequency: MaintenanceFrequency, paymentDateStr: string): string => {
  const baseDate = currentDueDateStr ? new Date(currentDueDateStr) : new Date(paymentDateStr);
  if (isNaN(baseDate.getTime())) return new Date('2026-07-09').toISOString().split('T')[0];
  
  const nextDate = new Date(baseDate);
  switch (frequency) {
    case 'Tous les mois':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'Tous les 2 mois':
      nextDate.setMonth(nextDate.getMonth() + 2);
      break;
    case 'Tous les 3 mois':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'Tous les 6 mois':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'Chaque année':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate.toISOString().split('T')[0];
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeded, setIsSeeded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Core database states
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);

  // Load all data from Firestore
  const loadAllData = async () => {
    try {
      const fetchedClients = await getClients();
      const fetchedProjects = await getProjects();
      const fetchedContracts = await getContracts();
      const fetchedPayments = await getPayments();
      const fetchedRelances = await getRelances();

      setClients(fetchedClients);
      setProjects(fetchedProjects);
      setContracts(fetchedContracts);
      setPayments(fetchedPayments);
      setRelances(fetchedRelances);
      setError(null);
    } catch (err) {
      console.error("Error loading application data:", err);
      setError(err instanceof Error ? err.message : "Erreur inattendue de chargement.");
    }
  };

  // Run on mount
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Run automatic seeding if database is empty
        const didSeed = await checkAndSeedData();
        setIsSeeded(didSeed);
        await loadAllData();
      } catch (err) {
        console.error("Error initializing app:", err);
        setError(err instanceof Error ? err.message : "Erreur d'initialisation.");
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const refreshAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de rafraîchissement.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS HANDLERS ---

  // Clients
  const handleAddClient = async (clientData: Omit<Client, 'createdAt'>) => {
    setIsLoading(true);
    await addClient({
      ...clientData,
      createdAt: new Date().toISOString()
    });
    await loadAllData();
    setIsLoading(false);
  };

  const handleUpdateClient = async (id: string, clientData: Partial<Client>) => {
    setIsLoading(true);
    await updateClient(id, clientData);
    await loadAllData();
    setIsLoading(false);
  };

  const handleDeleteClient = async (id: string) => {
    setIsLoading(true);
    await deleteClient(id);
    await loadAllData();
    setIsLoading(false);
  };

  // Projects
  const handleAddProject = async (projectData: Omit<Project, 'createdAt'>) => {
    setIsLoading(true);
    await addProject({
      ...projectData,
      createdAt: new Date().toISOString()
    });
    await loadAllData();
    setIsLoading(false);
  };

  const handleUpdateProject = async (id: string, projectData: Partial<Project>) => {
    setIsLoading(true);
    await updateProject(id, projectData);
    await loadAllData();
    setIsLoading(false);
  };

  const handleDeleteProject = async (id: string) => {
    setIsLoading(true);
    await deleteProject(id);
    await loadAllData();
    setIsLoading(false);
  };

  // Contracts
  const handleAddContract = async (contractData: Omit<Contract, 'createdAt'>) => {
    setIsLoading(true);
    await addContract({
      ...contractData,
      createdAt: new Date().toISOString()
    });
    await loadAllData();
    setIsLoading(false);
  };

  const handleUpdateContract = async (id: string, contractData: Partial<Contract>) => {
    setIsLoading(true);
    await updateContract(id, contractData);
    await loadAllData();
    setIsLoading(false);
  };

  const handleDeleteContract = async (id: string) => {
    setIsLoading(true);
    await deleteContract(id);
    await loadAllData();
    setIsLoading(false);
  };

  // Payments
  const handleAddPayment = async (paymentData: Omit<Payment, 'createdAt'>) => {
    setIsLoading(true);
    await addPayment({
      ...paymentData,
      createdAt: new Date().toISOString()
    });
    await loadAllData();
    setIsLoading(false);
  };

  const handleDeletePayment = async (id: string) => {
    setIsLoading(true);
    await deletePayment(id);
    await loadAllData();
    setIsLoading(false);
  };

  // Unified payment callback with dynamic renewal logic!
  const handleLogMaintenancePayment = async (
    contract: Contract,
    paymentDate: string,
    amount: number,
    reference: string,
    comment: string,
    paymentMethod: string
  ) => {
    setIsLoading(true);
    try {
      // 1. Calculate next renewal date
      const nextDueDate = calculateNextDueDate(contract.prochaineEcheance, contract.frequence, paymentDate);

      // 2. Add payment record to historic database
      await addPayment({
        clientId: contract.clientId,
        projetId: contract.projetId,
        contratId: contract.id!,
        type: 'maintenance',
        montant: amount,
        datePaiement: paymentDate,
        moyenPaiement: paymentMethod,
        reference: reference,
        commentaire: comment,
        createdAt: new Date().toISOString()
      });

      // 3. Advance Next Due Date inside contract
      await updateContract(contract.id!, {
        prochaineEcheance: nextDueDate
      });

      await loadAllData();
    } catch (err) {
      console.error("Error logging maintenance payment:", err);
    }
    setIsLoading(false);
  };

  // Relances outreach messages log
  const handleAddRelance = async (relanceData: Omit<Relance, 'id'>) => {
    await addRelance(relanceData);
    await loadAllData();
  };

  const handleUpdateRelance = async (id: string, relanceData: Partial<Relance>) => {
    await updateRelance(id, relanceData);
    await loadAllData();
  };

  const handleDeleteRelance = async (id: string) => {
    await deleteRelance(id);
    await loadAllData();
  };

  // Check alert state (active contracts overdue)
  const todayStr = '2026-07-09';
  const overdueAlertsCount = contracts.filter(c => c.statut === 'Actif' && c.prochaineEcheance < todayStr).length;
  

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans antialiased text-zinc-900" id="main-application-frame">
    
      {/* Mobile Top Bar */}
      <header className="md:hidden w-full bg-zinc-950 text-white h-14 fixed top-0 left-0 flex items-center justify-between px-4 z-40 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="font-extrabold text-sm tracking-wider uppercase font-mono">SiteCare Manager</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 text-zinc-300 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar backdrop for mobile view */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden no-print"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-zinc-950 text-white flex flex-col justify-between z-40 shadow-xl border-r border-zinc-900 no-print
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:flex-shrink-0
      `}>
        <div>
          {/* Logo Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></span>
              <h1 className="font-black text-sm tracking-widest uppercase font-mono text-white">SiteCare</h1>
            </div>
            {isSeeded && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md animate-pulse">
                Demo active
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'projets', label: 'Projets (Sites)', icon: FolderKanban },
              { id: 'contrats', label: 'Maintenances', icon: ShieldCheck, alert: overdueAlertsCount > 0 },
              { id: 'compta', label: 'Journal de caisse', icon: Coins },
              { id: 'relances', label: 'Relances (Rappels)', icon: BellRing },
              { id: 'calendrier', label: 'Calendrier', icon: CalendarRange },
              { id: 'rapports', label: 'Statistiques & Exports', icon: BarChart3 }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-lg transition-all group relative
                    ${isActive 
                      ? 'bg-amber-500 text-zinc-950 shadow-xs' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 shrink-0 transition-colors
                      ${isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-amber-500'}
                    `} />
                    <span>{item.label}</span>
                  </div>

                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Workspace Profile bottom footer */}
       {/* User Workspace Profile bottom footer */}
<div className="p-4 border-t border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
  <div className="space-y-0.5">
    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Développeur</span>
    <p className="text-xs font-bold text-white leading-none">Yaniss-Elie Sey</p>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={async () => await registerNotifications()}
      className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-amber-500 rounded-lg transition-colors border border-zinc-900"
      title="Activer les notifications"
    >
      <BellRing className="w-3.5 h-3.5" />
    </button>
    <button 
      onClick={refreshAllData}
      className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors border border-zinc-900"
      title="Rafraîchir les données de Firestore"
    >
      <RefreshCw className="w-3.5 h-3.5" />
    </button>
  </div>
</div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 min-w-0 md:pt-0 pt-14 flex flex-col relative">
        
        {/* Spinner Loader overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xs z-50 flex items-center justify-center no-print">
            <div className="bg-zinc-950 text-white rounded-xl shadow-xl px-5 py-3 border border-zinc-800 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              <span className="text-xs font-semibold font-mono tracking-wide">Mise à jour Firestore...</span>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Header section titles */}
          <div className="flex items-center justify-between no-print border-b border-zinc-200/50 pb-4">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'clients' && 'Annuaire des clients'}
                {activeTab === 'projets' && 'Suivi des projets'}
                {activeTab === 'contrats' && 'Contrats de maintenance'}
                {activeTab === 'compta' && 'Flux de trésorerie'}
                {activeTab === 'relances' && 'Messages de relance'}
                {activeTab === 'calendrier' && 'Échéancier temporel'}
                {activeTab === 'rapports' && 'Générateur de rapports'}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {activeTab === 'dashboard' && 'Vue d\'ensemble de votre activité de développement et maintenance'}
                {activeTab === 'clients' && 'Fiches clients complètes et historiques chronologiques d\'activités'}
                {activeTab === 'projets' && 'Paramétrage des livrables, prix de vente de site et liaisons maintenance'}
                {activeTab === 'contrats' && 'Facturation récurrente préventive et corrective de vos clients'}
                {activeTab === 'compta' && 'Journal complet des encaissements effectués'}
                {activeTab === 'relances' && 'Génération automatique de relances de paiement WhatsApp ou e-mail'}
                {activeTab === 'calendrier' && 'Visualisation des échéances de maintenance futures et des retards'}
                {activeTab === 'rapports' && 'Indicateurs de croissance annuels et mensuels avec exports CSV / PDF'}
              </p>
            </div>
            
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Heure système</span>
              <p className="text-xs font-semibold text-zinc-800 font-mono">09 Juillet 2026</p>
            </div>
          </div>

          {/* Error Banner if any */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 no-print animate-fade-in shadow-sm">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <h4 className="font-bold text-sm">Erreur d'accès à la base de données</h4>
                <p className="text-xs text-rose-700">
                  {error.includes('{"error"') ? (
                    (() => {
                      try {
                        const parsed = JSON.parse(error);
                        return `L'opération [${parsed.operationType.toUpperCase()}] sur '${parsed.path || "le chemin"}' a échoué : ${parsed.error}`;
                      } catch (e) {
                        return error;
                      }
                    })()
                  ) : error}
                </p>
                <div className="text-[10px] text-rose-600 mt-2 font-mono bg-rose-100/40 p-2 rounded border border-rose-200/50 break-all max-h-24 overflow-y-auto">
                  Si le problème persiste, veuillez rafraîchir les données ou vérifier le déploiement des règles Firestore. Détail : {error}
                </div>
              </div>
            </div>
          )}

          {/* Active Tab rendering router */}
          <div className="transition-all duration-150">
            {activeTab === 'dashboard' && (
              <Dashboard 
                clients={clients} 
                projects={projects} 
                contracts={contracts} 
                payments={payments}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'clients' && (
              <ClientsList
                clients={clients}
                projects={projects}
                contracts={contracts}
                payments={payments}
                relances={relances}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
              />
            )}

            {activeTab === 'projets' && (
              <ProjectsList
                projects={projects}
                clients={clients}
                contracts={contracts}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onAddContract={handleAddContract}
              />
            )}

            {activeTab === 'contrats' && (
              <ContractsList
                contracts={contracts}
                clients={clients}
                projects={projects}
                onUpdateContract={handleUpdateContract}
                onDeleteContract={handleDeleteContract}
                onLogMaintenancePayment={handleLogMaintenancePayment}
              />
            )}

            {activeTab === 'compta' && (
              <PaymentsList
                payments={payments}
                clients={clients}
                projects={projects}
                contracts={contracts}
                onAddPayment={handleAddPayment}
              />
            )}

            {activeTab === 'relances' && (
              <RelancesList
                relances={relances}
                clients={clients}
                projects={projects}
                payments={payments}
                onAddRelance={handleAddRelance}
                onUpdateRelance={handleUpdateRelance}
                onDeleteRelance={handleDeleteRelance}
                onAddPayment={handleAddPayment}
                onDeletePayment={handleDeletePayment}
              />
            )}

            {activeTab === 'calendrier' && (
              <CalendarView
                clients={clients}
                projects={projects}
                contracts={contracts}
                payments={payments}
              />
            )}

            {activeTab === 'rapports' && (
              <ReportsView
                clients={clients}
                projects={projects}
                contracts={contracts}
                payments={payments}
              />
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
