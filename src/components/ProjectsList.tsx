import React, { useState } from 'react';
import { Client, Project, Contract, ProjectStatus, ProjectSaleStatus, MaintenanceFrequency } from '../types';
import { Plus, Search, Edit2, Trash2, Calendar, Shield, ExternalLink, Server, X, Check, DollarSign, Clock, AlertCircle } from 'lucide-react';

interface ProjectsListProps {
  projects: Project[];
  clients: Client[];
  contracts: Contract[];
  onAddProject: (project: Omit<Project, 'createdAt'>) => Promise<any>;
  onUpdateProject: (id: string, project: Partial<Project>) => Promise<any>;
  onDeleteProject: (id: string) => Promise<any>;
  onAddContract: (contract: Omit<Contract, 'createdAt'>) => Promise<any>;
}

export default function ProjectsList({
  projects,
  clients,
  contracts,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddContract
}: ProjectsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [selectedProjectForContract, setSelectedProjectForContract] = useState<Project | null>(null);

  // Project Form states
  const [clientId, setClientId] = useState('');
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [typeSite, setTypeSite] = useState('Vitrine');
  const [domaine, setDomaine] = useState('');
  const [hebergement, setHebergement] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateLivraison, setDateLivraison] = useState('');
  const [statut, setStatut] = useState<ProjectStatus>('En développement');
  const [prixSite, setPrixSite] = useState(500000); // Default 500k FCFA
  const [datePaiementSite, setDatePaiementSite] = useState('');
  const [statutVente, setStatutVente] = useState<ProjectSaleStatus>('Non payé');

  // Contract Form states (for fast binding)
  const [contractMontant, setContractMontant] = useState(50000); // Default 50k FCFA
  const [contractFrequence, setContractFrequence] = useState<MaintenanceFrequency>('Tous les mois');
  const [contractDateDebut, setContractDateDebut] = useState('2026-07-09');

  const openAddModal = () => {
    setClientId(clients[0]?.id || '');
    setNom('');
    setDescription('');
    setTypeSite('Vitrine');
    setDomaine('');
    setHebergement('');
    setDateDebut('2026-07-09');
    setDateLivraison('');
    setStatut('En développement');
    setPrixSite(500000);
    setDatePaiementSite('');
    setStatutVente('Non payé');
    setIsAddModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setProjectToEdit(project);
    setClientId(project.clientId);
    setNom(project.nom);
    setDescription(project.description);
    setTypeSite(project.typeSite);
    setDomaine(project.domaine);
    setHebergement(project.hebergement);
    setDateDebut(project.dateDebut);
    setDateLivraison(project.dateLivraison || '');
    setStatut(project.statut);
    setPrixSite(project.prixSite);
    setDatePaiementSite(project.datePaiementSite || '');
    setStatutVente(project.statutVente);
    setIsEditModalOpen(true);
  };

  const openContractModal = (project: Project) => {
    setSelectedProjectForContract(project);
    setContractMontant(50000);
    setContractFrequence('Tous les mois');
    setContractDateDebut('2026-07-09');
    setIsContractModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !nom || !prixSite) return;
    await onAddProject({
      clientId,
      nom,
      description,
      typeSite,
      domaine,
      hebergement,
      dateDebut,
      dateLivraison,
      statut,
      prixSite: Number(prixSite),
      datePaiementSite,
      statutVente
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit || !clientId || !nom) return;
    await onUpdateProject(projectToEdit.id!, {
      clientId,
      nom,
      description,
      typeSite,
      domaine,
      hebergement,
      dateDebut,
      dateLivraison,
      statut,
      prixSite: Number(prixSite),
      datePaiementSite,
      statutVente
    });
    setIsEditModalOpen(false);
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForContract) return;

    // Calculate initial next due date matching start date plus frequency
    const calculateInitialDueDate = (start: string, freq: MaintenanceFrequency): string => {
      const base = new Date(start);
      if (isNaN(base.getTime())) return start;
      const next = new Date(base);
      switch (freq) {
        case 'Tous les mois': next.setMonth(next.getMonth() + 1); break;
        case 'Tous les 2 mois': next.setMonth(next.getMonth() + 2); break;
        case 'Tous les 3 mois': next.setMonth(next.getMonth() + 3); break;
        case 'Tous les 6 mois': next.setMonth(next.getMonth() + 6); break;
        case 'Chaque année': next.setFullYear(next.getFullYear() + 1); break;
      }
      return next.toISOString().split('T')[0];
    };

    const nextDueDate = calculateInitialDueDate(contractDateDebut, contractFrequence);

    await onAddContract({
      projetId: selectedProjectForContract.id!,
      clientId: selectedProjectForContract.clientId,
      montant: Number(contractMontant),
      frequence: contractFrequence,
      dateDebut: contractDateDebut,
      prochaineEcheance: nextDueDate,
      statut: 'Actif'
    });

    setIsContractModalOpen(false);
  };

  // Filter projects by search & status
  const filteredProjects = projects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const client = clients.find(c => c.id === p.clientId);
    const matchesSearch = 
      p.nom.toLowerCase().includes(searchLower) ||
      p.domaine.toLowerCase().includes(searchLower) ||
      client?.nom.toLowerCase().includes(searchLower) ||
      client?.entreprise.toLowerCase().includes(searchLower);

    if (statusFilter === 'Tous') return matchesSearch;
    return matchesSearch && p.statut === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher projet, domaine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800"
            />
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Tous', 'En développement', 'Livré', 'Suspendu', 'Terminé'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap
                  ${statusFilter === status
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Nouveau projet
        </button>
      </div>

      {/* Projects list workspace */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200/80 p-12 text-center">
          <p className="text-zinc-500 text-sm">Aucun projet ne correspond aux critères.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const client = clients.find(c => c.id === proj.clientId);
            const hasContract = contracts.some(c => c.projetId === proj.id);

            return (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-zinc-200/80 hover:border-zinc-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block font-mono">
                        {proj.typeSite}
                      </span>
                      <h3 className="font-bold text-base text-zinc-900 mt-0.5 group-hover:text-amber-600 transition-colors">
                        {proj.nom}
                      </h3>
                    </div>
                    
                    {/* Project Status label */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border
                      ${proj.statut === 'En développement' ? 'bg-amber-50 text-amber-800 border-amber-200/60' : ''}
                      ${proj.statut === 'Livré' ? 'bg-sky-50 text-sky-800 border-sky-200/60' : ''}
                      ${proj.statut === 'Terminé' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' : ''}
                      ${proj.statut === 'Suspendu' ? 'bg-zinc-100 text-zinc-600 border-zinc-300/60' : ''}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full
                        ${proj.statut === 'En développement' ? 'bg-amber-500' : ''}
                        ${proj.statut === 'Livré' ? 'bg-sky-500' : ''}
                        ${proj.statut === 'Terminé' ? 'bg-emerald-500' : ''}
                        ${proj.statut === 'Suspendu' ? 'bg-zinc-400' : ''}
                      `}></span>
                      {proj.statut}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 bg-zinc-50/70 p-2.5 rounded-lg border border-zinc-100 mb-4">
                    <p className="text-zinc-600 font-medium">Client: <span className="text-zinc-900 font-semibold">{client?.nom || 'Inconnu'}</span></p>
                    <p className="text-zinc-500 italic text-[11px] line-clamp-2">{proj.description || 'Pas de description'}</p>
                  </div>

                  {/* Technical specifics */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="border border-zinc-100 p-2 rounded-lg bg-zinc-50/20">
                      <p className="text-zinc-400 text-[10px] uppercase font-mono">Domaine</p>
                      <a 
                        href={`https://${proj.domaine}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-medium text-zinc-800 hover:text-amber-600 inline-flex items-center gap-1 mt-0.5 truncate"
                      >
                        {proj.domaine || 'Non configuré'}
                        {proj.domaine && <ExternalLink className="w-3 h-3 shrink-0" />}
                      </a>
                    </div>
                    <div className="border border-zinc-100 p-2 rounded-lg bg-zinc-50/20">
                      <p className="text-zinc-400 text-[10px] uppercase font-mono">Hébergement</p>
                      <p className="font-medium text-zinc-800 mt-0.5 flex items-center gap-1 truncate">
                        <Server className="w-3.5 h-3.5 text-zinc-400" />
                        {proj.hebergement || 'Non hébergé'}
                      </p>
                    </div>
                  </div>

                  {/* Vente du site & Prix tracker */}
                  <div className="border border-zinc-150/80 rounded-xl p-3 bg-zinc-50/30 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-[10px] uppercase font-mono leading-none">Vente du site</p>
                      <p className="font-bold text-sm text-zinc-900 font-mono mt-1">
                        {proj.prixSite.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                        ${proj.statutVente === 'Payé' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${proj.statutVente === 'Acompte reçu' ? 'bg-amber-100 text-amber-800' : ''}
                        ${proj.statutVente === 'Non payé' ? 'bg-rose-100 text-rose-800' : ''}
                      `}>
                        {proj.statutVente === 'Payé' && <Check className="w-3.5 h-3.5" />}
                        {proj.statutVente === 'Acompte reçu' && <DollarSign className="w-3.5 h-3.5 animate-pulse" />}
                        {proj.statutVente === 'Non payé' && <Clock className="w-3.5 h-3.5" />}
                        {proj.statutVente}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2 mt-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-2 border border-zinc-200 hover:border-zinc-300 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Voulez-vous supprimer le projet "${proj.nom}" ? Cette action effacera aussi l'historique associé.`)) {
                          await onDeleteProject(proj.id!);
                        }
                      }}
                      className="p-2 border border-rose-100 hover:border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Maintenance contract bind button */}
                  {hasContract ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 bg-emerald-50 text-emerald-800 text-xs font-semibold">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      Maintenance liée
                    </span>
                  ) : (
                    <button
                      onClick={() => openContractModal(proj)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-amber-200 bg-amber-50/60 hover:bg-amber-50 text-amber-800 hover:text-amber-900 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      + Activer Maintenance
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <h3 className="text-base font-semibold">Ajouter un nouveau projet de site</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Client Associé *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.entreprise})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Nom du Projet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Boutique en ligne Sylla"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Description du livrable</label>
                  <textarea
                    placeholder="Brief technique, architecture, technologies..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Type de site</label>
                  <select
                    value={typeSite}
                    onChange={(e) => setTypeSite(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="Vitrine">Site Vitrine</option>
                    <option value="E-commerce">E-Commerce</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="SaaS">SaaS / Web App</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Statut Projet</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="En développement">En développement</option>
                    <option value="Livré">Livré</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Domaine principal (URL)</label>
                  <input
                    type="text"
                    placeholder="Ex : monsite.sn"
                    value={domaine}
                    onChange={(e) => setDomaine(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Hébergement</label>
                  <input
                    type="text"
                    placeholder="Ex : Hostinger, o2switch"
                    value={hebergement}
                    onChange={(e) => setHebergement(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Date de début</label>
                  <input
                    type="date"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Date estimée de livraison</label>
                  <input
                    type="date"
                    value={dateLivraison}
                    onChange={(e) => setDateLivraison(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 border-t border-zinc-150 pt-3">
                  <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1">Informations Financières (Vente)</h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Prix de vente (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={prixSite}
                    onChange={(e) => setPrixSite(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Statut de Paiement</label>
                  <select
                    value={statutVente}
                    onChange={(e) => setStatutVente(e.target.value as ProjectSaleStatus)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="Non payé">Non payé</option>
                    <option value="Acompte reçu">Acompte reçu</option>
                    <option value="Payé">Payé</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Date de règlement du solde (si payé)</label>
                  <input
                    type="date"
                    value={datePaiementSite}
                    onChange={(e) => setDatePaiementSite(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg transition-colors text-sm font-medium shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <h3 className="text-base font-semibold">Modifier le projet</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Client Associé *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.entreprise})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Nom du Projet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Boutique en ligne Sylla"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Description du livrable</label>
                  <textarea
                    placeholder="Brief technique, architecture, technologies..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Type de site</label>
                  <select
                    value={typeSite}
                    onChange={(e) => setTypeSite(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="Vitrine">Site Vitrine</option>
                    <option value="E-commerce">E-Commerce</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="SaaS">SaaS / Web App</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Statut Projet</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="En développement">En développement</option>
                    <option value="Livré">Livré</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Domaine principal (URL)</label>
                  <input
                    type="text"
                    placeholder="Ex : monsite.sn"
                    value={domaine}
                    onChange={(e) => setDomaine(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Hébergement</label>
                  <input
                    type="text"
                    placeholder="Ex : Hostinger, o2switch"
                    value={hebergement}
                    onChange={(e) => setHebergement(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Date de début</label>
                  <input
                    type="date"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Date de livraison</label>
                  <input
                    type="date"
                    value={dateLivraison}
                    onChange={(e) => setDateLivraison(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 border-t border-zinc-150 pt-3">
                  <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1">Informations Financières (Vente)</h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Prix de vente (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={prixSite}
                    onChange={(e) => setPrixSite(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Statut de Paiement</label>
                  <select
                    value={statutVente}
                    onChange={(e) => setStatutVente(e.target.value as ProjectSaleStatus)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="Non payé">Non payé</option>
                    <option value="Acompte reçu">Acompte reçu</option>
                    <option value="Payé">Payé</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-zinc-600">Date de règlement du solde (si payé)</label>
                  <input
                    type="date"
                    value={datePaiementSite}
                    onChange={(e) => setDatePaiementSite(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg transition-colors text-sm font-medium shadow-xs"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Link/Create Maintenance Contract Modal */}
      {isContractModalOpen && selectedProjectForContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <div>
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Maintenance préventive & corrective</span>
                <h3 className="text-base font-semibold">Activer un contrat de maintenance</h3>
              </div>
              <button onClick={() => setIsContractModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleContractSubmit} className="p-5 space-y-4">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200/60 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-zinc-900">Projet ciblé : <span className="font-bold text-zinc-900">{selectedProjectForContract.nom}</span></p>
                <p className="text-zinc-500">Client : {clients.find(c => c.id === selectedProjectForContract.clientId)?.nom || 'Inconnu'}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Montant de la maintenance (FCFA) *</label>
                <input
                  type="number"
                  required
                  value={contractMontant}
                  onChange={(e) => setContractMontant(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Fréquence des règlements *</label>
                <select
                  value={contractFrequence}
                  onChange={(e) => setContractFrequence(e.target.value as MaintenanceFrequency)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                >
                  <option value="Tous les mois">Tous les mois (Mensuel)</option>
                  <option value="Tous les 2 mois">Tous les 2 mois (Bimestriel)</option>
                  <option value="Tous les 3 mois">Tous les 3 mois (Trimestriel)</option>
                  <option value="Tous les 6 mois">Tous les 6 mois (Semestriel)</option>
                  <option value="Chaque année">Chaque année (Annuel)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Date de prise d'effet du contrat *</label>
                <input
                  type="date"
                  required
                  value={contractDateDebut}
                  onChange={(e) => setContractDateDebut(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <p className="text-[11px] text-zinc-400 italic">
                * Note : La première échéance de facturation sera automatiquement calculée à compter de cette date d'effet.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg transition-colors text-sm font-medium shadow-xs"
                >
                  Lancer le contrat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
