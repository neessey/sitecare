import React, { useState } from 'react';
import { Client, Project, Contract, ContractStatus, MaintenanceFrequency } from '../types';
import { Search, Shield, ShieldAlert, ShieldOff, Play, Pause, XCircle, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle, RefreshCcw, X } from 'lucide-react';

interface ContractsListProps {
  contracts: Contract[];
  clients: Client[];
  projects: Project[];
  onUpdateContract: (id: string, contract: Partial<Contract>) => Promise<any>;
  onDeleteContract: (id: string) => Promise<any>;
  onLogMaintenancePayment: (contract: Contract, paymentDate: string, amount: number, reference: string, comment: string, paymentMethod: string) => Promise<any>;
}

export default function ContractsList({
  contracts,
  clients,
  projects,
  onUpdateContract,
  onDeleteContract,
  onLogMaintenancePayment
}: ContractsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // Payment Log Modal states
  const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
  const [activeContractForPayment, setActiveContractForPayment] = useState<Contract | null>(null);
  const [paymentDate, setPaymentDate] = useState('2026-07-09');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentComment, setPaymentComment] = useState('');

  // Edit Contract Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [editMontant, setEditMontant] = useState(0);
  const [editFrequence, setEditFrequence] = useState<MaintenanceFrequency>('Tous les mois');
  const [editProchaineEcheance, setEditProchaineEcheance] = useState('');
  const [editStatut, setEditStatut] = useState<ContractStatus>('Actif');

  const openLogPayment = (contract: Contract) => {
    setActiveContractForPayment(contract);
    setPaymentDate('2026-07-09');
    setPaymentAmount(contract.montant);
    setPaymentMethod('Wave');
    setPaymentRef('');
    setPaymentComment('Paiement pour maintenance périodique.');
    setIsLogPaymentOpen(true);
  };

  const handleLogPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContractForPayment) return;

    await onLogMaintenancePayment(
      activeContractForPayment,
      paymentDate,
      Number(paymentAmount),
      paymentRef,
      paymentComment,
      paymentMethod
    );
    
    setIsLogPaymentOpen(false);
  };

  const openEditModal = (contract: Contract) => {
    setContractToEdit(contract);
    setEditMontant(contract.montant);
    setEditFrequence(contract.frequence);
    setEditProchaineEcheance(contract.prochaineEcheance);
    setEditStatut(contract.statut);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractToEdit) return;

    await onUpdateContract(contractToEdit.id!, {
      montant: Number(editMontant),
      frequence: editFrequence,
      prochaineEcheance: editProchaineEcheance,
      statut: editStatut
    });

    setIsEditModalOpen(false);
  };

  // Helper to calculate days remaining until next renewal
  const getDaysRemainingInfo = (prochaineEcheance: string, status: ContractStatus) => {
    if (status !== 'Actif') return { text: 'Inactif', color: 'text-zinc-400 bg-zinc-100', days: 9999, overdue: false };

    const todayStr = '2026-07-09';
    const targetDate = new Date(prochaineEcheance);
    const currentDate = new Date(todayStr);

    const timeDiff = targetDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return {
        text: `En retard de ${Math.abs(daysDiff)} jour${Math.abs(daysDiff) > 1 ? 's' : ''}`,
        color: 'text-rose-700 bg-rose-50 border border-rose-200/50',
        days: daysDiff,
        overdue: true
      };
    } else if (daysDiff === 0) {
      return {
        text: "Aujourd'hui !",
        color: 'text-amber-800 bg-amber-50 border border-amber-300 animate-pulse',
        days: daysDiff,
        overdue: false
      };
    } else if (daysDiff <= 7) {
      return {
        text: `Dans ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`,
        color: 'text-amber-700 bg-amber-50/50 border border-amber-200/50',
        days: daysDiff,
        overdue: false
      };
    } else {
      return {
        text: `Dans ${daysDiff} jours`,
        color: 'text-emerald-700 bg-emerald-50/40 border border-emerald-100',
        days: daysDiff,
        overdue: false
      };
    }
  };

  // Filter contracts
  const filteredContracts = contracts.filter(c => {
    const proj = projects.find(p => p.id === c.projetId);
    const client = clients.find(cl => cl.id === c.clientId);
    const matchesSearch = 
      proj?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.entreprise.toLowerCase().includes(searchTerm.toLowerCase());

    const isOverdue = getDaysRemainingInfo(c.prochaineEcheance, c.statut).overdue;

    if (statusFilter === 'Tous') return matchesSearch;
    if (statusFilter === 'Actifs') return matchesSearch && c.statut === 'Actif';
    if (statusFilter === 'Suspendus') return matchesSearch && c.statut === 'Suspendu';
    if (statusFilter === 'En retard') return matchesSearch && c.statut === 'Actif' && isOverdue;
    return matchesSearch;
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
              placeholder="Rechercher contrat client, projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800"
            />
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Tous', 'Actifs', 'Suspendus', 'En retard'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap
                  ${statusFilter === f
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid workspace */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200/80 p-12 text-center">
          <p className="text-zinc-500 text-sm">Aucun contrat de maintenance trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => {
            const project = projects.find(p => p.id === contract.projetId);
            const client = clients.find(cl => cl.id === contract.clientId);
            const rInfo = getDaysRemainingInfo(contract.prochaineEcheance, contract.statut);

            return (
              <div
                key={contract.id}
                className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between hover:shadow-md
                  ${contract.statut === 'Actif' && rInfo.overdue 
                    ? 'border-rose-300 ring-1 ring-rose-300/10' 
                    : 'border-zinc-200/80'
                  }
                `}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg border
                        ${contract.statut === 'Actif' 
                          ? rInfo.overdue 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                        }
                      `}>
                        {contract.statut === 'Actif' ? (
                          rInfo.overdue ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />
                        ) : (
                          <ShieldOff className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 leading-tight">
                          {project?.nom || 'Projet inconnu'}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {client?.nom} ({client?.entreprise})
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                      ${contract.statut === 'Actif' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''}
                      ${contract.statut === 'Suspendu' ? 'bg-amber-50 text-amber-800 border-amber-200' : ''}
                      ${contract.statut === 'Résilié' ? 'bg-rose-50 text-rose-800 border-rose-200' : ''}
                    `}>
                      {contract.statut}
                    </span>
                  </div>

                  {/* Pricing info */}
                  <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-zinc-50 rounded-xl border border-zinc-150/50 text-center">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block">Abonnement</span>
                      <span className="font-bold text-base text-zinc-900 font-mono mt-0.5 block">
                        {contract.montant.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block">Fréquence</span>
                      <span className="font-medium text-xs text-zinc-800 mt-1.5 block">
                        {contract.frequence}
                      </span>
                    </div>
                  </div>

                  {/* Deadline info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Prochaine échéance :</span>
                      <span className="font-mono text-zinc-950 font-bold">{contract.prochaineEcheance}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Statut d'échéance :</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${rInfo.color}`}>
                        {rInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2 mt-2">
                  <div className="flex gap-2">
                    {contract.statut === 'Actif' ? (
                      <button
                        onClick={async () => {
                          if (confirm("Voulez-vous suspendre ce contrat ? Les rappels seront désactivés.")) {
                            await onUpdateContract(contract.id!, { statut: 'Suspendu' });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg transition-colors"
                        title="Suspendre"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await onUpdateContract(contract.id!, { statut: 'Actif' });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors"
                        title="Réactiver"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Activer
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(contract)}
                      className="p-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 rounded-lg transition-colors"
                      title="Modifier les paramètres"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {contract.statut === 'Actif' && (
                    <button
                      onClick={() => openLogPayment(contract)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      Régler Échéance
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Log Payment Modal */}
      {isLogPaymentOpen && activeContractForPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold">Maintenance de site</span>
                <h3 className="text-base font-semibold">Enregistrer un paiement de maintenance</h3>
              </div>
              <button onClick={() => setIsLogPaymentOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLogPaymentSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-emerald-950">Maintenance de : {projects.find(p => p.id === activeContractForPayment.projetId)?.nom}</p>
                <p className="text-zinc-600">Client : {clients.find(c => c.id === activeContractForPayment.clientId)?.nom}</p>
                <p className="text-zinc-600">Échéance à solder : <span className="font-bold text-zinc-900">{activeContractForPayment.prochaineEcheance}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Montant Reçu (FCFA) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Date du Règlement *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Moyen de Paiement *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Référence de Transaction</label>
                <input
                  type="text"
                  placeholder="Ex : Référence Wave, ID virement, etc."
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Observations / Commentaire</label>
                <textarea
                  value={paymentComment}
                  onChange={(e) => setPaymentComment(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-normal font-medium">
                  <strong>RENOLVELLEMENT AUTOMATIQUE :</strong> En enregistrant ce paiement, le système calculera automatiquement la nouvelle date d'échéance du contrat en fonction de sa fréquence ({activeContractForPayment.frequence}).
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLogPaymentOpen(false)}
                  className="flex-1 py-2 px-4 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg transition-colors text-sm font-medium shadow-xs"
                >
                  Confirmer Règlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Contract Details Modal */}
      {isEditModalOpen && contractToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <h3 className="text-base font-semibold">Paramètres du contrat</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Montant d'échéance (FCFA)</label>
                <input
                  type="number"
                  value={editMontant}
                  onChange={(e) => setEditMontant(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Fréquence de facturation</label>
                <select
                  value={editFrequence}
                  onChange={(e) => setEditFrequence(e.target.value as MaintenanceFrequency)}
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
                <label className="text-xs font-semibold text-zinc-600">Date de prochaine échéance</label>
                <input
                  type="date"
                  value={editProchaineEcheance}
                  onChange={(e) => setEditProchaineEcheance(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Statut du Contrat</label>
                <select
                  value={editStatut}
                  onChange={(e) => setEditStatut(e.target.value as ContractStatus)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                >
                  <option value="Actif">Actif</option>
                  <option value="Suspendu">Suspendu</option>
                  <option value="Résilié">Résilié</option>
                </select>
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
