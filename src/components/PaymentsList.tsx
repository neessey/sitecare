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

  // stand-alone Add Payment Modal (useful for raw site payments)
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [projetId, setProjetId] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('site');
  const [montant, setMontant] = useState(250000);
  const [datePaiement, setDatePaiement] = useState('2026-07-09');
  const [moyenPaiement, setMoyenPaiement] = useState('Wave');
  const [reference, setReference] = useState('');
  const [commentaire, setCommentaire] = useState('');

  // Handle client change to update corresponding projects list
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

  // Filter payments
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

  // Calculate cumulative sum
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.montant, 0);

  return (
    <div className="space-y-6">
      {/* Search, metrics and actions bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
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
          
          <div className="flex items-center gap-1.5">
            {['Tous', 'site', 'maintenance'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap capitalize
                  ${typeFilter === type
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }
                `}
              >
                {type === 'Tous' ? 'Tous les paiements' : type === 'site' ? 'Vente de sites' : 'Abonnements Maintenance'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openAddPaymentModal}
          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Enregistrer un paiement
        </button>
      </div>

      {/* Grid structure splitting ledger table and statistics summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Statistics and summaries sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-950 text-white p-5 rounded-xl border border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
              <DollarSign className="w-40 h-40" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 font-mono">Ledger Ledger</span>
            <h3 className="text-sm font-semibold text-zinc-400 mt-0.5">Recettes Cumulées</h3>
            <p className="text-2xl font-black font-mono mt-3 text-white">
              {totalAmount.toLocaleString()} FCFA
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              Somme des {filteredPayments.length} paiements affichés
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Répartition par canal</h4>
            
            <div className="space-y-2.5">
              {['Wave', 'Orange Money', 'Virement bancaire', 'Espèces'].map(method => {
                const count = filteredPayments.filter(p => p.moyenPaiement === method).length;
                const sum = filteredPayments.filter(p => p.moyenPaiement === method).reduce((acc, curr) => acc + curr.montant, 0);
                const percent = totalAmount > 0 ? (sum / totalAmount) * 100 : 0;

                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-600 font-medium">{method} ({count})</span>
                      <span className="font-semibold text-zinc-900 font-mono">{sum.toLocaleString()} FCFA</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200/80 text-xs font-bold text-zinc-500 uppercase font-mono">
                  <th className="p-4">Détails de l'opération</th>
                  <th className="p-4">Nature</th>
                  <th className="p-4">Canal & Réf</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      Aucun paiement enregistré dans l'historique.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const client = clients.find(c => c.id === pay.clientId);
                    const project = projects.find(pr => pr.id === pay.projetId);

                    return (
                      <tr key={pay.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-zinc-900">{project?.nom || 'Site Web'}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{client?.nom} ({client?.entreprise})</div>
                          <div className="text-xs text-zinc-500 italic mt-1 bg-zinc-50 border border-zinc-100 p-1.5 rounded-md inline-block max-w-xs truncate">
                            {pay.commentaire || 'Aucun commentaire'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                            ${pay.type === 'site' 
                              ? 'bg-sky-50 text-sky-800 border-sky-100' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            }
                          `}>
                            {pay.type === 'site' ? 'Création site' : 'Maintenance'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-zinc-800 text-xs">{pay.moyenPaiement}</div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{pay.reference || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded-sm text-zinc-600">
                            {pay.datePaiement}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-zinc-950 font-mono">
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

      {/* Standalone Add Payment Modal */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-950 text-white">
              <h3 className="text-base font-semibold">Enregistrer un versement manuel</h3>
              <button onClick={() => setIsAddPaymentOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Client Débiteur *</label>
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
                <label className="text-xs font-semibold text-zinc-600">Projet Associé *</label>
                <select
                  value={projetId}
                  onChange={(e) => setProjetId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                >
                  {projects.filter(p => p.clientId === clientId).map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                  {projects.filter(p => p.clientId === clientId).length === 0 && (
                    <option value="">Aucun projet enregistré pour ce client</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Type de Recette</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
                  >
                    <option value="site">Création de site</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Montant Reçu (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={montant}
                    onChange={(e) => setMontant(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Date de Réception *</label>
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
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Référence Unique de Transaction</label>
                <input
                  type="text"
                  placeholder="ID de versement ou numéro de reçu..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Notes d'accompagnement</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
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
    </div>
  );
}
