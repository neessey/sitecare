import React, { useState } from 'react';
import { Client, Project, Contract, Payment, Relance } from '../types';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, FileText, X, Check, Calendar, ChevronRight, History, MessageSquare } from 'lucide-react';

interface ClientsListProps {
  clients: Client[];
  projects: Project[];
  contracts: Contract[];
  payments: Payment[];
  relances: Relance[];
  onAddClient: (client: Omit<Client, 'createdAt'>) => Promise<any>;
  onUpdateClient: (id: string, client: Partial<Client>) => Promise<any>;
  onDeleteClient: (id: string) => Promise<any>;
}

export default function ClientsList({
  clients,
  projects,
  contracts,
  payments,
  relances,
  onAddClient,
  onUpdateClient,
  onDeleteClient
}: ClientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [telephone, setTelephone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [notes, setNotes] = useState('');

  // Handle open add modal
  const openAddModal = () => {
    setNom('');
    setEntreprise('');
    setTelephone('');
    setWhatsapp('');
    setEmail('');
    setAdresse('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  // Handle open edit modal
  const openEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientToEdit(client);
    setNom(client.nom);
    setEntreprise(client.entreprise);
    setTelephone(client.telephone);
    setWhatsapp(client.whatsapp || '');
    setEmail(client.email);
    setAdresse(client.adresse);
    setNotes(client.notes);
    setIsEditModalOpen(true);
  };

  // Handle submit add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !entreprise) return;
    await onAddClient({ nom, entreprise, telephone, whatsapp, email, adresse, notes });
    setIsAddModalOpen(false);
  };

  // Handle submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientToEdit || !nom || !entreprise) return;
    await onUpdateClient(clientToEdit.id!, { nom, entreprise, telephone, whatsapp, email, adresse, notes });
    setIsEditModalOpen(false);
    if (selectedClient?.id === clientToEdit.id) {
      setSelectedClient({ ...selectedClient, nom, entreprise, telephone, whatsapp, email, adresse, notes });
    }
  };

  // Filter clients by search
  const filteredClients = clients.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.nom.toLowerCase().includes(searchLower) ||
      c.entreprise.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.telephone.toLowerCase().includes(searchLower) ||
      (c.whatsapp && c.whatsapp.toLowerCase().includes(searchLower))
    );
  });

  // Calculate client-specific history timeline
  const getClientTimeline = (clientId: string) => {
    const timeline: { date: string; type: string; title: string; desc: string; amount?: number }[] = [];

    // 1. Client creation
    const client = clients.find(c => c.id === clientId);
    if (client) {
      timeline.push({
        date: client.createdAt.split('T')[0],
        type: 'creation',
        title: "Création de la fiche client",
        desc: `Client ${client.nom} (${client.entreprise}) enregistré dans le système.`
      });
    }

    // 2. Projects created
    projects.filter(p => p.clientId === clientId).forEach(p => {
      timeline.push({
        date: p.dateDebut,
        type: 'project_start',
        title: `Lancement de projet: ${p.nom}`,
        desc: `Début du développement du site (${p.typeSite}). Montant convenu : ${p.prixSite.toLocaleString()} FCFA.`
      });
      if (p.dateLivraison && p.statut === 'Livré' || p.statut === 'Terminé') {
        timeline.push({
          date: p.dateLivraison,
          type: 'project_delivery',
          title: `Livraison de projet: ${p.nom}`,
          desc: `Site livré au client. Domaine configuré : ${p.domaine}.`
        });
      }
    });

    // 3. Contracts added
    contracts.filter(c => c.clientId === clientId).forEach(c => {
      const proj = projects.find(p => p.id === c.projetId);
      timeline.push({
        date: c.dateDebut,
        type: 'contract_start',
        title: `Contrat de maintenance activé`,
        desc: `Abonnement de maintenance initié pour ${proj?.nom || 'site web'}. Montant : ${c.montant.toLocaleString()} FCFA (${c.frequence}).`
      });
    });

    // 4. Payments received
    payments.filter(p => p.clientId === clientId).forEach(p => {
      timeline.push({
        date: p.datePaiement,
        type: 'payment',
        title: p.type === 'site' ? "Paiement reçu : Vente de site" : "Paiement reçu : Maintenance",
        desc: `${p.commentaire || 'Règlement validé.'} Moyen : ${p.moyenPaiement}. Réf : ${p.reference || 'Aucune'}`,
        amount: p.montant
      });
    });

    // 5. Reminders sent
    relances.filter(r => r.clientId === clientId).forEach(r => {
      timeline.push({
        date: r.dateEnvoi,
        type: 'outreach',
        title: `Relance envoyée : ${r.canal}`,
        desc: `Message de rappel généré pour un montant de ${r.montant.toLocaleString()} FCFA (${r.typePaiement}).`
      });
    });

    // Sort descending by date
    return timeline.sort((a, b) => b.date.localeCompare(a.date));
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher nom, entreprise, tél..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-zinc-800"
          />
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {/* Main clients workspace layout (split or grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients list list/grid */}
        <div className={`lg:col-span-${selectedClient ? '1' : '3'} ${selectedClient ? 'hidden lg:block' : 'block'} space-y-3`}>
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200/80 p-12 text-center">
              <p className="text-zinc-500 text-sm">Aucun client trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
              {filteredClients.map((client) => {
                const isClientSelected = selectedClient?.id === client.id;
                const clientProjectsCount = projects.filter(p => p.clientId === client.id).length;
                const clientContractsCount = contracts.filter(c => c.clientId === client.id && c.statut === 'Actif').length;

                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row lg:flex-col justify-between items-start md:items-center lg:items-start gap-4 hover:shadow-xs group
                      ${isClientSelected 
                        ? 'bg-amber-50/40 border-amber-500/30 ring-1 ring-amber-500/20' 
                        : 'bg-white border-zinc-200/80 hover:border-zinc-300'
                      }
                    `}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 group-hover:text-amber-700 transition-colors">
                          {client.nom}
                        </span>
                        <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
                          {client.entreprise}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {client.telephone}</span>
                        {client.whatsapp && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium" title="Numéro WhatsApp">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> {client.whatsapp}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {client.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto lg:w-full justify-between md:justify-end lg:justify-between pt-3 md:pt-0 lg:pt-3 border-t md:border-t-0 lg:border-t border-zinc-100">
                      <div className="flex gap-2">
                        <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-sm">
                          {clientProjectsCount} Projets
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-sm">
                          {clientContractsCount} Contrats Main.
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => openEditModal(client, e)}
                          className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Voulez-vous vraiment supprimer le client ${client.nom} et toutes ses données associées ?`)) {
                              await onDeleteClient(client.id!);
                              if (selectedClient?.id === client.id) setSelectedClient(null);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 rounded-md text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected client detailed view panel */}
        {selectedClient && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col h-full">
            {/* Header info */}
            <div className="p-6 bg-zinc-950 text-white relative">
              <button
                onClick={() => setSelectedClient(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase font-semibold tracking-widest text-amber-500 font-mono">Profil Client</span>
              <h2 className="text-2xl font-bold mt-1">{selectedClient.nom}</h2>
              <p className="text-zinc-400 text-sm mt-0.5">{selectedClient.entreprise}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Tél : {selectedClient.telephone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp : {selectedClient.whatsapp || selectedClient.telephone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{selectedClient.adresse || 'Aucune adresse renseignée'}</span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-2 text-zinc-600 text-xs font-semibold uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Observations / Notes</span>
              </div>
              <p className="text-sm text-zinc-600 bg-white p-3 rounded-lg border border-zinc-200 italic">
                {selectedClient.notes || 'Aucune note particulière.'}
              </p>
            </div>

            {/* Timeline history */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[450px]">
              <div className="flex items-center gap-2 text-zinc-800 text-sm font-semibold mb-6">
                <History className="w-4 h-4 text-amber-500" />
                <span>Historique chronologique des événements</span>
              </div>

              <div className="relative border-l border-zinc-200 pl-6 space-y-6">
                {getClientTimeline(selectedClient.id!).map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Event Type Dot marker */}
                    <span className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-4
                      ${event.type === 'creation' ? 'bg-zinc-400 ring-zinc-100' : ''}
                      ${event.type === 'project_start' ? 'bg-amber-400 ring-amber-50' : ''}
                      ${event.type === 'project_delivery' ? 'bg-sky-400 ring-sky-50' : ''}
                      ${event.type === 'contract_start' ? 'bg-emerald-400 ring-emerald-50' : ''}
                      ${event.type === 'payment' ? 'bg-emerald-500 ring-emerald-100' : ''}
                      ${event.type === 'outreach' ? 'bg-rose-400 ring-rose-50' : ''}
                    `}></span>

                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span className="font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-sm">{event.date}</span>
                      {event.amount && (
                        <span className="font-bold text-emerald-600 font-mono">+{event.amount.toLocaleString()} FCFA</span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-zinc-900">{event.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{event.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <h3 className="text-base font-semibold">Enregistrer un nouveau client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Nom du Client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Fatou Sylla"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Nom de l'Entreprise *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Sylla Couture & Design"
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex : +221 77 123 45 67"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">WhatsApp (si différent)</label>
                  <input
                    type="tel"
                    placeholder="Ex : +221 77 123 45 67"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex : client@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Adresse géographique</label>
                <input
                  type="text"
                  placeholder="Ex : Dakar, Sénégal"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Notes / Informations complémentaires</label>
                <textarea
                  placeholder="Observations sur le client..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
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

      {/* 2. Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <h3 className="text-base font-semibold">Modifier la fiche client</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Nom du Client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Fatou Sylla"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Nom de l'Entreprise *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Sylla Couture & Design"
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex : +221 77 123 45 67"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="Ex : +221 77 123 45 67"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex : client@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Adresse géographique</label>
                <input
                  type="text"
                  placeholder="Ex : Dakar, Sénégal"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Notes / Informations complémentaires</label>
                <textarea
                  placeholder="Observations sur le client..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-zinc-850 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
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
    </div>
  );
}
