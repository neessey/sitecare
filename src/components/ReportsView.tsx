import React, { useState } from 'react';
import { Client, Project, Contract, Payment } from '../types';
import { FileDown, Printer, DollarSign, TrendingUp, Briefcase, Activity, Download, Table } from 'lucide-react';

interface ReportsViewProps {
  clients: Client[];
  projects: Project[];
  contracts: Contract[];
  payments: Payment[];
}

export default function ReportsView({ clients, projects, contracts, payments }: ReportsViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // 1. Calculate revenues by nature
  const siteRevenues = payments.filter(p => p.type === 'site').reduce((acc, curr) => acc + curr.montant, 0);
  const maintenanceRevenues = payments.filter(p => p.type === 'maintenance').reduce((acc, curr) => acc + curr.montant, 0);
  const totalRevenues = siteRevenues + maintenanceRevenues;

  // 2. Group payments by Month (for selected year)
  const getMonthlyAggregate = () => {
    const months = Array.from({ length: 12 }).map((_, i) => ({
      index: i,
      name: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"][i],
      site: 0,
      maintenance: 0,
      total: 0
    }));

    payments.forEach(p => {
      const date = new Date(p.datePaiement);
      if (date.getFullYear() === selectedYear) {
        const monthIndex = date.getMonth();
        if (p.type === 'site') {
          months[monthIndex].site += p.montant;
        } else {
          months[monthIndex].maintenance += p.montant;
        }
        months[monthIndex].total += p.montant;
      }
    });

    return months;
  };

  const monthlyData = getMonthlyAggregate();

  // 3. Group payments by Year
  const getAnnualAggregate = () => {
    const yearsMap: { [key: number]: { site: number; maintenance: number; total: number } } = {};
    
    payments.forEach(p => {
      const year = new Date(p.datePaiement).getFullYear();
      if (!yearsMap[year]) {
        yearsMap[year] = { site: 0, maintenance: 0, total: 0 };
      }
      if (p.type === 'site') {
        yearsMap[year].site += p.montant;
      } else {
        yearsMap[year].maintenance += p.montant;
      }
      yearsMap[year].total += p.montant;
    });

    return Object.entries(yearsMap).map(([yr, val]) => ({
      year: Number(yr),
      ...val
    })).sort((a, b) => b.year - a.year);
  };

  const annualData = getAnnualAggregate();

  // --- EXPORT SCRIPTS ---

  // Export payments as CSV
  const exportPaymentsCSV = () => {
    const headers = ['ID', 'Client', 'Entreprise', 'Projet', 'Type', 'Montant (FCFA)', 'Date', 'Moyen', 'Reference', 'Observation'];
    const rows = payments.map(p => {
      const client = clients.find(c => c.id === p.clientId);
      const project = projects.find(pr => pr.id === p.projetId);
      return [
        p.id || '',
        client?.nom || 'Inconnu',
        client?.entreprise || '',
        project?.nom || '',
        p.type === 'site' ? 'Création site' : 'Maintenance',
        p.montant,
        p.datePaiement,
        p.moyenPaiement,
        p.reference || '',
        p.commentaire || ''
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\ufeff" 
      + [headers.join(';'), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sitecare_ledger_paiements_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Clients directory as Excel-compatible CSV tabbed
  const exportClientsCSV = () => {
    const headers = ['Nom', 'Entreprise', 'Telephone', 'Email', 'Adresse', 'Notes', 'Date de Creation'];
    const rows = clients.map(c => [
      c.nom,
      c.entreprise,
      c.telephone,
      c.email,
      c.adresse || '',
      c.notes || '',
      c.createdAt.split('T')[0]
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\ufeff"
      + [headers.join(';'), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sitecare_repertoire_clients.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print layout
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="reports-view-section">
      {/* KPI Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Part de la Vente</span>
            <h4 className="text-xl font-bold font-mono text-zinc-900 mt-1">{siteRevenues.toLocaleString()} FCFA</h4>
            <p className="text-xs text-zinc-400 mt-1">Sites créés & livrés</p>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Part Récurrente</span>
            <h4 className="text-xl font-bold font-mono text-zinc-900 mt-1">{maintenanceRevenues.toLocaleString()} FCFA</h4>
            <p className="text-xs text-zinc-400 mt-1">Contrats de maintenance</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-950 text-white rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 font-mono">Chiffre d'Affaires</span>
            <h4 className="text-xl font-black font-mono text-white mt-1">{totalRevenues.toLocaleString()} FCFA</h4>
            <p className="text-xs text-zinc-400 mt-1">Revenu brut cumulé</p>
          </div>
          <div className="p-3 bg-amber-500 rounded-xl text-zinc-950">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action panel to export reports */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs no-print">
        <div>
          <h3 className="font-semibold text-sm text-zinc-900">Centre d'exportation de rapports</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Sauvegardez vos données d'activité au format tabulaire ou imprimez-les</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={exportClientsCSV}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded-lg transition-all"
            title="Exporter Répertoire Clients au format Excel / CSV"
          >
            <Table className="w-4 h-4 text-amber-500" />
            Export Clients
          </button>
          
          <button
            onClick={exportPaymentsCSV}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded-lg transition-all"
            title="Exporter Journal de caisse"
          >
            <FileDown className="w-4 h-4 text-amber-500" />
            Export Paiements (CSV)
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold text-white rounded-lg transition-all"
            title="Imprimer le rapport ou générer un PDF"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Grid split of monthly & annual aggregated details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly table of selected year */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 no-print">
            <h4 className="font-bold text-zinc-900 text-sm">Tableau de répartition mensuel ({selectedYear})</h4>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2.5 py-1 text-xs font-semibold border border-zinc-200 rounded-lg bg-zinc-50"
            >
              <option value={2026}>Année 2026</option>
              <option value={2025}>Année 2025</option>
            </select>
          </div>

          <div className="print-only hidden mb-4">
            <h2 className="text-xl font-bold text-zinc-950">Rapport de recettes mensuel - Année {selectedYear}</h2>
            <p className="text-xs text-zinc-500">Généré le {new Date().toLocaleDateString()}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50/50 text-zinc-500 font-bold border-b border-zinc-100 font-mono uppercase">
                  <th className="p-3">Mois</th>
                  <th className="p-3 text-right">Vente Sites</th>
                  <th className="p-3 text-right">Maintenance</th>
                  <th className="p-3 text-right">Recette Totale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700 font-medium">
                {monthlyData.map(m => (
                  <tr key={m.index} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-3 text-zinc-900 font-semibold">{m.name}</td>
                    <td className="p-3 text-right font-mono text-zinc-600">
                      {m.site > 0 ? `${m.site.toLocaleString()} FCFA` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-600">
                      {m.maintenance > 0 ? `${m.maintenance.toLocaleString()} FCFA` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold font-mono text-zinc-950">
                      {m.total > 0 ? `${m.total.toLocaleString()} FCFA` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Annual aggregate overview */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6">
          <h4 className="font-bold text-zinc-900 text-sm mb-4">Suivi de croissance annuel</h4>

          <div className="space-y-4">
            {annualData.map(y => (
              <div key={y.year} className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-sm">Exercice {y.year}</span>
                  <span className="font-black text-sm text-zinc-950 font-mono">{y.total.toLocaleString()} FCFA</span>
                </div>
                
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-950 h-full" style={{ width: '100%' }}></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-medium pt-1">
                  <div>
                    <span>Sites : </span>
                    <span className="font-semibold text-zinc-700 font-mono">{y.site.toLocaleString()} FCFA</span>
                  </div>
                  <div className="text-right">
                    <span>Main. : </span>
                    <span className="font-semibold text-emerald-600 font-mono">{y.maintenance.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            ))}

            {annualData.length === 0 && (
              <p className="text-zinc-500 text-center py-10 text-xs">Aucune donnée annuelle cumulée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
