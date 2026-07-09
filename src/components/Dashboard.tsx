import React from 'react';
import { Client, Project, Contract, Payment } from '../types';
import { Users, Layout, TrendingUp, AlertTriangle, ShieldCheck, Clock, CalendarDays, WalletCards, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
  projects: Project[];
  contracts: Contract[];
  payments: Payment[];
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ clients, projects, contracts, payments, onNavigateToTab }: DashboardProps) {
  const todayStr = '2026-07-09';
  const currentYearMonth = '2026-07';

  // --- STATS CALCULATIONS ---

  // 1. Total Clients
  const totalClients = clients.length;

  // 2. Sites sold (Livré or Terminé)
  const totalSitesSold = projects.filter(p => p.statut === 'Livré' || p.statut === 'Terminé').length;

  // 3. Total CA (Revenue)
  const totalCA = payments.reduce((acc, p) => acc + p.montant, 0);

  // 4. Monthly CA (July 2026)
  const monthlyCA = payments
    .filter(p => p.datePaiement.startsWith(currentYearMonth))
    .reduce((acc, p) => acc + p.montant, 0);

  // 5. Active contracts
  const activeContracts = contracts.filter(c => c.statut === 'Actif').length;

  // Helper to parse dates and check remaining days
  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date(todayStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 6. Overdue payments (Active contracts where due date is in the past)
  const overdueContracts = contracts.filter(c => c.statut === 'Actif' && c.prochaineEcheance < todayStr);
  const overduePaymentsCount = overdueContracts.length;
  const overduePaymentsAmount = overdueContracts.reduce((acc, c) => acc + c.montant, 0);

  // 7. Expected Payments (Montant restant à percevoir)
  // - Sites with "Non payé" or "Acompte reçu": Remaining site price (prixSite - paid deposits)
  const siteExpected = projects.reduce((acc, p) => {
    if (p.statutVente === 'Payé') return acc;
    const paidForProject = payments
      .filter(pay => pay.projetId === p.id && pay.type === 'site')
      .reduce((s, pay) => s + pay.montant, 0);
    return acc + (p.prixSite - paidForProject);
  }, 0);

  // - Active maintenance contracts due soon in this month (or overdue)
  const maintenanceExpected = contracts
    .filter(c => c.statut === 'Actif' && c.prochaineEcheance >= todayStr && c.prochaineEcheance.startsWith(currentYearMonth))
    .reduce((acc, c) => acc + c.montant, 0);

  const totalExpected = siteExpected + maintenanceExpected + overduePaymentsAmount;

  // 8. Upcoming deadlines (due today or within 7 days, or overdue)
  const upcomingDeadlines = contracts
    .filter(c => c.statut === 'Actif')
    .map(c => {
      const days = getDaysDiff(c.prochaineEcheance);
      const proj = projects.find(p => p.id === c.projetId);
      const client = clients.find(cl => cl.id === c.clientId);
      return {
        ...c,
        projectName: proj?.nom || 'Site Web',
        clientNom: client?.nom || 'Inconnu',
        entreprise: client?.entreprise || '',
        daysRemaining: days
      };
    })
    .sort((a, b) => a.prochaineEcheance.localeCompare(b.prochaineEcheance));

  // Alert system categorizer (due today, due in 7 days, overdue, expired)
  const alertsList = upcomingDeadlines.filter(item => item.daysRemaining <= 7);

  return (
    <div className="space-y-6">
      {/* KPI Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI: Clients */}
        <div 
          onClick={() => onNavigateToTab('clients')}
          className="bg-white rounded-xl border border-zinc-200/80 p-5 flex items-center justify-between shadow-xs hover:border-zinc-300 transition-all cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">Clients Actifs</span>
            <h4 className="text-2xl font-extrabold text-zinc-900 group-hover:text-amber-700 transition-colors">{totalClients}</h4>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              Fiches enregistrées <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />
            </p>
          </div>
          <div className="p-3 bg-zinc-50 text-zinc-800 rounded-xl group-hover:bg-zinc-100 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Sites Sold */}
        <div 
          onClick={() => onNavigateToTab('projets')}
          className="bg-white rounded-xl border border-zinc-200/80 p-5 flex items-center justify-between shadow-xs hover:border-zinc-300 transition-all cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">Sites Vendus</span>
            <h4 className="text-2xl font-extrabold text-zinc-900 group-hover:text-amber-700 transition-colors">{totalSitesSold}</h4>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              Livrés ou terminés <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />
            </p>
          </div>
          <div className="p-3 bg-zinc-50 text-zinc-800 rounded-xl group-hover:bg-zinc-100 transition-colors">
            <Layout className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Monthly Revenue */}
        <div 
          onClick={() => onNavigateToTab('compta')}
          className="bg-white rounded-xl border border-zinc-200/80 p-5 flex items-center justify-between shadow-xs hover:border-zinc-300 transition-all cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">CA du Mois (Juillet)</span>
            <h4 className="text-xl font-black text-emerald-600 font-mono">{monthlyCA.toLocaleString()} FCFA</h4>
            <p className="text-[11px] text-zinc-500">Flux de trésorerie direct</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Total Cumulative Revenue */}
        <div 
          onClick={() => onNavigateToTab('rapports')}
          className="bg-zinc-950 text-white rounded-xl p-5 flex items-center justify-between shadow-md hover:bg-zinc-900 transition-all cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 font-mono">Chiffre d'Affaires Brut</span>
            <h4 className="text-xl font-black text-white font-mono">{totalCA.toLocaleString()} FCFA</h4>
            <p className="text-[11px] text-zinc-400">Totalité des encaissements</p>
          </div>
          <div className="p-3 bg-amber-500 text-zinc-950 rounded-xl">
            <WalletCards className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Second row of aggregators: Expected payments and Overdues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Expected and pending Inflows */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block">Reste à Percevoir (Attendu)</span>
            <p className="text-2xl font-black text-zinc-900 font-mono mt-1.5">
              {totalExpected.toLocaleString()} FCFA
            </p>
            <span className="text-xs text-zinc-500 mt-1 block font-medium">
              Sites restants : {siteExpected.toLocaleString()} FCFA | Maintenances : {(maintenanceExpected + overduePaymentsAmount).toLocaleString()} FCFA
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl">
            <Clock className="w-6 h-6 shrink-0" />
          </div>
        </div>

        {/* Overdues Alert panel */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block">Paiements en Retard</span>
            <p className="text-2xl font-black text-rose-600 font-mono mt-1.5">
              {overduePaymentsAmount.toLocaleString()} FCFA
            </p>
            <span className="text-xs text-rose-600/80 mt-1 block font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {overduePaymentsCount} contrat{overduePaymentsCount > 1 ? 's' : ''} en attente de renouvellement
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 shrink-0" />
          </div>
        </div>

      </div>

      {/* Main bottom section: Alert Center & Immediate Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alert Center (due today, overdue, within 7 days) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <h3 className="font-bold text-zinc-900 text-base">Alertes & Relances critiques</h3>
              </div>
              <button 
                onClick={() => onNavigateToTab('relances')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
              >
                Gérer les rappels &rarr;
              </button>
            </div>

            {alertsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-zinc-500 text-sm">Tout est en ordre ! Aucun paiement en retard ni relance urgente pour les 7 prochains jours.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {alertsList.map((alert) => {
                  const isOverdue = alert.daysRemaining < 0;
                  const isToday = alert.daysRemaining === 0;

                  return (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all
                        ${isOverdue 
                          ? 'bg-rose-50/40 border-rose-100/80 hover:border-rose-200' 
                          : isToday 
                            ? 'bg-amber-50 border-amber-200 animate-pulse'
                            : 'bg-zinc-50/50 border-zinc-150 hover:border-zinc-300'
                        }
                      `}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase
                            ${isOverdue ? 'bg-rose-100 text-rose-800' : isToday ? 'bg-amber-200 text-amber-900' : 'bg-zinc-200 text-zinc-800'}
                          `}>
                            {isOverdue ? 'En retard' : isToday ? "Aujourd'hui" : `Dans ${alert.daysRemaining} j`}
                          </span>
                          <span className="font-bold text-sm text-zinc-900">{alert.projectName}</span>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">
                          Client: {alert.clientNom} ({alert.entreprise}) &bull; Échéance: <span className="font-mono text-zinc-800 font-bold">{alert.prochaineEcheance}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                        <span className="font-bold text-sm text-zinc-900 font-mono">
                          {alert.montant.toLocaleString()} FCFA
                        </span>
                        
                        <button
                          onClick={() => onNavigateToTab('relances')}
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          Relancer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick maintenance stats */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-zinc-900 text-base">Contrats de maintenance</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block">Abonnements Actifs</span>
                <span className="text-lg font-bold text-zinc-950 block mt-0.5">{activeContracts} contrats</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                En service
              </span>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide block">Fréquence préférée</span>
                <span className="text-xs font-bold text-zinc-950 block mt-1">Mensuel (Tous les mois)</span>
              </div>
              <span className="px-2 py-1 rounded bg-zinc-200 text-zinc-700 text-[10px] font-mono font-bold">
                85% des abonnés
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('contrats')}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors text-center block"
          >
            Voir tous les abonnements &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
