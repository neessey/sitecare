import React, { useState } from 'react';
import { Client, Project, Contract, Payment, PaymentType } from '../types';
import { Search, Plus, DollarSign, Calendar, CheckCircle2, FileText, ArrowDownCircle, ArrowUpCircle, X, Layers } from 'lucide-react';

interface PaymentsListProps {
  payments: Payment[];
  clients: Client[];
  projects: Project[];
  contracts: Contract[];
  onAddPayment: (payment: Omit<Payment, 'createdAt'>) => Promise<any>;
}

export default function PaymentsList({
  payments,
  clients,
  projects,
  contracts,
  onAddPayment
}: PaymentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [projetId, setProjetId] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('site');
  const [montant, setMontant] = useState(250000);
  const [datePaiement, setDatePaiement] = useState('2026-07-09');
  const [moyenPaiement, setMoyenPaiement] = useState('Wave');
  const [reference, setReference] = useState('');
  const [commentaire, setCommentaire] = useState('');

  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const clientProjects = projects.filter(p => p.clientId === cId);
    setProjetId(clientProjects[0]?.id || '');
  };

  const openAddPaymentModal = () => {
    const firstClient = clients[0]?.id || '';
    setClientId(firstClient);
    const firstClientProj = projects.filter(p => p.clientId === firstClient)[0]?.id || '';
    setProjetId(firstClientProj);
    setPaymentType('site');
    setMontant(250000);
    setDatePaiement('2026-07-09');
    setMoyenPaiement('Wave');
    setReference('');
    setCommentaire('Règlement enregistré.');
    setIsAddPaymentOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !projetId || !montant) return;

    await onAddPayment({
      clientId,
      projetId,
      type: paymentType,
      montant: Number(montant),
      datePaiement,
      moyenPaiement,
      reference,
      commentaire
    });

    setIsAddPaymentOpen(false);
  };

  const filteredPayments = payments.filter(p => {
    const client = clients.find(c => c.id === p.clientId);
    const project = projects.find(pr => pr.id === p.projetId);
    const matchesSearch = 
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.commentaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.nom.toLowerCase().includes(searchTerm.toLowerCase());

    if (typeFilter === 'Tous') return matchesSearch;
    return matchesSearch && p.type === typeFilter;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.montant, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search, metrics and actions bar - responsive */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 md:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher référence, client, projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800"
            />
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
            {['Tous', 'site', 'maintenance'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2 sm:px-3 py-1.5 text-[9px] sm:text-xs font-medium rounded-lg border transition-all whitespace-nowrap capitalize flex-shrink-0 touch-manipulation
                  ${typeFilter === type
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200'
                  }
                `}
              >
                {type === 'Tous' ? 'Tous' : type === 'site' ? 'Sites' : 'Maintenance'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openAddPaymentModal}
          className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 active:bg-zinc-700 transition-colors text-xs sm:text-sm font-medium shadow-xs touch-manipulation"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Enregistrer un paiement</span>
        </button>
      </div>

      {/* Grid structure - responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Statistics and summaries sidebar */}
        <div className="lg:col-span-1 space-y-3 md:space-y-4 order-2 lg:order-1">
          <div className="bg-zinc-950 text-white p-4 sm:p-5 rounded-xl border border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
              <DollarSign className="w-32 sm:w-40 h-32 sm:h-40" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 font-mono">Ledger</span>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-400 mt-0.5">Recettes Cumulées</h3>
            <p className="text-xl sm:text-2xl font-black font-mono mt-2 sm:mt-3 text-white break-words">
              {totalAmount.toLocaleString()} FCFA
            </p>
            <p className="text-xs text-zinc-400 mt-1 sm:mt-2">
              {filteredPayments.length} paiements affichés
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Répartition</h4>
            
            <div className="space-y-2.5">
              {['Wave', 'Orange Money', 'Virement bancaire', 'Espèces'].map(method => {
                const count = filteredPayments.filter(p => p.moyenPaiement === method).length;
                const sum = filteredPayments.filter(p => p.moyenPaiement === method).reduce((acc, curr) => acc + curr.montant, 0);
                const percent = totalAmount > 0 ? (sum / totalAmount) * 100 : 0;

                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs gap-1">
                      <span className="text-zinc-600 font-medium truncate">{method} ({count})</span>
                      <span className="font-semibold text-zinc-900 font-mono text-[10px] sm:text-xs whitespace-nowrap">
                        {sum.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ledger Table - responsive */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden order-1 lg:order-2">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200/80 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase font-mono">
                  <th className="p-2 sm:p-4">Détails</th>
                  <th className="p-2 sm:p-4">Nature</th>
                  <th className="p-2 sm:p-4">Canal/Réf</th>
                  <th className="p-2 sm:p-4">Date</th>
                  <th className="p-2 sm:p-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 sm:p-8 text-center text-zinc-500 text-xs sm:text-sm">
                      Aucun paiement enregistré.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const client = clients.find(c => c.id === pay.clientId);
                    const project = projects.find(pr => pr.id === pay.projetId);

                    return (
                      <tr key={pay.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-2 sm:p-4">
                          <div className="font-semibold text-zinc-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                            {project?.nom || 'Site Web'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate max-w-[120px] sm:max-w-none">
                            {client?.nom}
                          </div>
                          <div className="text-[9px] sm:text-xs text-zinc-500 italic mt-1 bg-zinc-50 border border-zinc-100 p-1 sm:p-1.5 rounded-md inline-block max-w-[140px] sm:max-w-xs truncate">
                            {pay.commentaire || 'Aucun commentaire'}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4">
                          <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold border whitespace-nowrap
                            ${pay.type === 'site' 
                              ? 'bg-sky-50 text-sky-800 border-sky-100' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            }
                          `}>
                            {pay.type === 'site' ? 'Site' : 'Maintenance'}
                          </span>
                        </td>
                        <td className="p-2 sm:p-4">
                          <div className="font-medium text-zinc-800 text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-none">
                            {pay.moyenPaiement}
                          </div>
                          <div className="text-[8px] sm:text-[10px] text-zinc-400 font-mono mt-0.5 truncate max-w-[80px] sm:max-w-none">
                            {pay.reference || 'N/A'}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4">
                          <span className="text-[9px] sm:text-xs font-mono bg-zinc-100 px-1.5 sm:px-2 py-0.5 rounded-sm text-zinc-600 whitespace-nowrap">
                            {pay.datePaiement}
                          </span>
                        </td>
                        <td className="p-2 sm:p-4 text-right font-bold text-zinc-950 font-mono text-[10px] sm:text-sm whitespace-nowrap">
                          {pay.montant.toLocaleString()} FCFA
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Standalone Add Payment Modal - responsive */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white sticky top-0 z-10">
              <h3 className="text-sm sm:text-base font-semibold">Enregistrer un paiement</h3>
              <button onClick={() => setIsAddPaymentOpen(false)} className="text-zinc-400 hover:text-white transition-colors touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.entreprise})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Projet *</label>
                <select
                  value={projetId}
                  onChange={(e) => setProjetId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                >
                  {projects.filter(p => p.clientId === clientId).map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                  {projects.filter(p => p.clientId === clientId).length === 0 && (
                    <option value="">Aucun projet</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Type</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="site">Création site</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Montant (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={montant}
                    onChange={(e) => setMontant(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Date *</label>
                  <input
                    type="date"
                    required
                    value={datePaiement}
                    onChange={(e) => setDatePaiement(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Canal *</label>
                  <select
                    value={moyenPaiement}
                    onChange={(e) => setMoyenPaiement(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Virement bancaire">Virement</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Référence</label>
                <input
                  type="text"
                  placeholder="ID de transaction..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Commentaire</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 resize-none"
                  placeholder="Informations complémentaires..."
                />
              </div>

              <div className="flex flex-col xs:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="flex-1 py-2 px-4 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium order-2 xs:order-1 touch-manipulation"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg transition-colors text-sm font-medium shadow-xs order-1 xs:order-2 touch-manipulation"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}