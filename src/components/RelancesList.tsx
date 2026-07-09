import React, { useState } from 'react';
import { Client, Project, Relance, RelanceChannel, RelanceStatus, Payment } from '../types';
import { Plus, Search, MessageSquare, Clipboard, Share2, Mail, CheckCircle2, AlertCircle, Trash2, X, Send } from 'lucide-react';

interface RelancesListProps {
  relances: Relance[];
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  onAddRelance: (relance: Omit<Relance, 'id'>) => Promise<any>;
  onUpdateRelance: (id: string, relance: Partial<Relance>) => Promise<any>;
  onDeleteRelance: (id: string) => Promise<any>;
  onAddPayment: (payment: Omit<Payment, 'createdAt'>) => Promise<any>;
  onDeletePayment: (id: string) => Promise<any>;
}

export default function RelancesList({
  relances,
  clients,
  projects,
  payments,
  onAddRelance,
  onUpdateRelance,
  onDeleteRelance,
  onAddPayment,
  onDeletePayment
}: RelancesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('Tous');

  // Generator states
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [typePaiement, setTypePaiement] = useState('Maintenance Mensuelle');
  const [montant, setMontant] = useState(5000);
  const [lienPaiement, setLienPaiement] = useState('https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci/?amount=5000');
  const [dateEcheance, setDateEcheance] = useState('2026-07-15');

  // Generated Text state
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Template model
  const generateMessageBody = (clientNom: string, montantVal: number, typePaiementVal: string, projNom: string, lienVal: string) => {
    return `Bonjour ${clientNom},

J'espère que vous allez bien.

Il est temps d'effectuer le règlement de ${montantVal.toLocaleString()} FCFA correspondant à ${typePaiementVal} de votre projet ${projNom}.

Vous pouvez effectuer votre paiement en toute sécurité via le lien ci-dessous :

${lienVal}

Une fois le paiement effectué, n'hésitez pas à me le confirmer.

Merci pour votre confiance.

Yaniss-Elie Sey`;
  };

  // When client changes in generator, update project dropdown
  const handleClientChange = (cId: string) => {
    setSelectedClientId(cId);
    const clientProj = projects.filter(p => p.clientId === cId);
    const firstProj = clientProj[0];
    setSelectedProjectId(firstProj?.id || '');
    
    // Auto populate values if project exists
    if (firstProj) {
      setMontant(firstProj.prixSite);
      setDateEcheance(firstProj.dateLivraison || '2026-07-15');
    }
  };

  // Trigger preview generation
  const handleGeneratePreview = () => {
    const client = clients.find(c => c.id === selectedClientId);
    const project = projects.find(p => p.id === selectedProjectId);
    if (!client || !project) return;

    const body = generateMessageBody(
      client.nom,
      Number(montant),
      typePaiement,
      project.nom,
      lienPaiement
    );
    setGeneratedMessage(body);
  };

  const handleOpenGenerator = () => {
    const firstClient = clients[0]?.id || '';
    setSelectedClientId(firstClient);
    const firstClientProj = projects.filter(p => p.clientId === firstClient);
    setSelectedProjectId(firstClientProj[0]?.id || '');
    setTypePaiement('Maintenance Mensuelle');
    setMontant(5000);
    setLienPaiement('https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci/?amount=5000');
    setDateEcheance('2026-07-15');
    setGeneratedMessage('');
    setIsCopied(false);
    setIsGeneratorOpen(true);
  };

  const handleCopyText = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);

      // Log to history as 'Copie' outreach
      const client = clients.find(c => c.id === selectedClientId);
      const project = projects.find(p => p.id === selectedProjectId);
      if (client && project) {
        await onAddRelance({
          clientId: selectedClientId,
          clientNom: client.nom,
          projetId: selectedProjectId,
          projetNom: project.nom,
          typePaiement,
          montant: Number(montant),
          lienPaiement,
          dateEcheance,
          dateEnvoi: new Date().toISOString().split('T')[0],
          canal: 'Copie',
          statut: 'Envoyé'
        });
      }
    } catch (err) {
      console.error("Erreur de copie", err);
    }
  };

  const handleShareWhatsApp = () => {
    const client = clients.find(c => c.id === selectedClientId);
    const project = projects.find(p => p.id === selectedProjectId);
    if (!client || !project) return;

    // Use whatsapp number if available, otherwise fallback to telephone
    const phoneToUse = client.whatsapp || client.telephone;
    const cleanPhone = phoneToUse.replace(/\s+/g, '');
    const url = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(generatedMessage)}`;
    
    window.open(url, '_blank');

    // Log to history
    onAddRelance({
      clientId: selectedClientId,
      clientNom: client.nom,
      projetId: selectedProjectId,
      projetNom: project.nom,
      typePaiement,
      montant: Number(montant),
      lienPaiement,
      dateEcheance,
      dateEnvoi: new Date().toISOString().split('T')[0],
      canal: 'WhatsApp',
      statut: 'Envoyé'
    });
  };

  const handleShareEmail = () => {
    const client = clients.find(c => c.id === selectedClientId);
    const project = projects.find(p => p.id === selectedProjectId);
    if (!client || !project) return;

    const subject = `Rappel de paiement - Projet ${project.nom}`;
    const url = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedMessage)}`;
    
    window.open(url, '_blank');

    // Log to history
    onAddRelance({
      clientId: selectedClientId,
      clientNom: client.nom,
      projetId: selectedProjectId,
      projetNom: project.nom,
      typePaiement,
      montant: Number(montant),
      lienPaiement,
      dateEcheance,
      dateEnvoi: new Date().toISOString().split('T')[0],
      canal: 'Email',
      statut: 'Envoyé'
    });
  };

  // Filter history log
  const filteredRelances = relances.filter(r => {
    const matchesSearch = 
      r.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.projetNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.typePaiement.toLowerCase().includes(searchTerm.toLowerCase());

    if (channelFilter === 'Tous') return matchesSearch;
    return matchesSearch && r.canal === channelFilter;
  });

return (
  <div className="space-y-4 md:space-y-6">
    {/* Search and Action row - responsive */}
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 md:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-zinc-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher relance client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800"
          />
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
          {['Tous', 'WhatsApp', 'Email', 'Copie'].map((canal) => (
            <button
              key={canal}
              onClick={() => setChannelFilter(canal)}
              className={`px-2 sm:px-2.5 py-1.5 text-[9px] sm:text-xs font-medium rounded-lg border transition-all whitespace-nowrap touch-manipulation flex-shrink-0
                ${channelFilter === canal
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200'
                }
              `}
            >
              {canal === 'Tous' ? 'Tous' : canal}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleOpenGenerator}
        className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 active:bg-zinc-700 transition-colors text-xs sm:text-sm font-medium shadow-xs touch-manipulation"
      >
        <MessageSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="truncate">Générer une relance</span>
      </button>
    </div>

    {/* Grid workspace - responsive */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* History of messages sent - takes 2 columns on desktop */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-xs p-3 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-5 h-5 text-amber-500 shrink-0" />
          <h3 className="font-semibold text-zinc-900 text-sm sm:text-base">Historique des relances</h3>
          {filteredRelances.length > 0 && (
            <span className="ml-auto text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
              {filteredRelances.length}
            </span>
          )}
        </div>

        {filteredRelances.length === 0 ? (
          <div className="text-center py-8 sm:py-12 border border-dashed border-zinc-200 rounded-xl">
            <p className="text-zinc-500 text-sm">Aucun historique de relance disponible.</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[400px] sm:max-h-[480px] overflow-y-auto pr-1">
            {filteredRelances.map((rel) => (
              <div 
                key={rel.id} 
                className="p-3 sm:p-4 rounded-xl border border-zinc-200/60 bg-zinc-50/20 hover:bg-zinc-50/50 hover:border-zinc-300 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-sm text-zinc-900 truncate">{rel.clientNom}</span>
                    <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-mono truncate max-w-[100px] sm:max-w-none">
                      {rel.projetNom}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium truncate">
                    {rel.typePaiement} ({rel.montant.toLocaleString()} FCFA)
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] text-zinc-400 font-medium pt-1">
                    <span>Transmis : {rel.dateEnvoi}</span>
                    <span className="hidden xs:inline">&bull;</span>
                    <span>Échéance : {rel.dateEcheance}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    {/* Channel badge */}
                    <span className={`inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold border
                      ${rel.canal === 'WhatsApp' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50' : ''}
                      ${rel.canal === 'Email' ? 'bg-sky-50 text-sky-800 border-sky-200/50' : ''}
                      ${rel.canal === 'Copie' ? 'bg-zinc-100 text-zinc-700 border-zinc-300/50' : ''}
                    `}>
                      {rel.canal === 'WhatsApp' ? 'WA' : rel.canal === 'Email' ? '📧' : '📋'}
                    </span>

                    {/* Status badge toggler */}
                    <button
                      onClick={async () => {
                        const nextStatus = rel.statut === 'Envoyé' ? 'Payé' : 'Envoyé';
                        await onUpdateRelance(rel.id!, { statut: nextStatus });
                        
                        if (nextStatus === 'Payé') {
                          const isMaintenance = rel.typePaiement.toLowerCase().includes('maintenance');
                          const isWave = rel.lienPaiement.toLowerCase().includes('wave');
                          const moyen = isWave ? 'Wave' : 'Orange Money';
                          await onAddPayment({
                            clientId: rel.clientId,
                            projetId: rel.projetId,
                            type: isMaintenance ? 'maintenance' : 'site',
                            montant: rel.montant,
                            datePaiement: new Date().toISOString().split('T')[0],
                            moyenPaiement: moyen,
                            reference: `RL-PAY-${rel.id}`,
                            commentaire: `Paiement enregistré via relance : ${rel.typePaiement}`
                          });
                        } else {
                          const matchingPayment = payments.find(p => p.reference === `RL-PAY-${rel.id}`);
                          if (matchingPayment && matchingPayment.id) {
                            await onDeletePayment(matchingPayment.id);
                          }
                        }
                      }}
                      className={`inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold border transition-all cursor-pointer touch-manipulation
                        ${rel.statut === 'Payé' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                        }
                      `}
                      title="Inverser le statut"
                    >
                      {rel.statut === 'Payé' ? <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />}
                      <span className="hidden xs:inline">{rel.statut}</span>
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      if (confirm("Supprimer cette relance de l'historique ?")) {
                        const matchingPayment = payments.find(p => p.reference === `RL-PAY-${rel.id}`);
                        if (matchingPayment && matchingPayment.id) {
                          await onDeletePayment(matchingPayment.id);
                        }
                        await onDeleteRelance(rel.id!);
                      }
                    }}
                    className="p-1.5 sm:p-1 hover:bg-rose-50 rounded text-zinc-400 hover:text-rose-600 transition-colors shrink-0 touch-manipulation"
                    title="Supprimer la relance"
                  >
                    <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generator widget instructions Card - responsive */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-4 sm:p-6 space-y-4">
        <h3 className="font-semibold text-zinc-900 text-sm sm:text-base">Modèle de relance</h3>
        <p className="text-zinc-500 text-xs leading-relaxed">
          Configurez un message instantané reprenant toutes les variables du client.
        </p>

        <div className="bg-zinc-50 rounded-xl p-3 sm:p-4 border border-zinc-150 relative text-xs text-zinc-600 font-mono space-y-1.5 leading-normal">
          <span className="absolute right-2 sm:right-3 top-2 sm:top-3 text-[9px] uppercase font-bold tracking-widest text-zinc-400 font-sans border border-zinc-200 bg-white px-2 py-0.5 rounded-sm">
            modèle
          </span>
          <p className="font-semibold text-zinc-900 text-[11px] sm:text-xs">Variables :</p>
          <p className="text-[11px] sm:text-xs">&bull; <span className="text-amber-600">{`{Nom client}`}</span></p>
          <p className="text-[11px] sm:text-xs">&bull; <span className="text-amber-600">{`{Montant}`}</span> FCFA</p>
          <p className="text-[11px] sm:text-xs">&bull; <span className="text-amber-600">{`{Type paiement}`}</span></p>
          <p className="text-[11px] sm:text-xs">&bull; <span className="text-amber-600">{`{Projet}`}</span></p>
          <p className="text-[11px] sm:text-xs">&bull; <span className="text-amber-600">{`{Lien paiement}`}</span></p>
        </div>
      </div>
    </div>

    {/* Generator Modal - fully responsive with two columns on desktop */}
    {isGeneratorOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-150">
          {/* Left Column: Form parameters - scrollable */}
          <div className="p-4 sm:p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-150 space-y-4 overflow-y-auto max-h-[60vh] md:max-h-[80vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-950">Paramétrer la relance</h3>
              <button onClick={() => setIsGeneratorOpen(false)} className="text-zinc-400 hover:text-zinc-600 md:hidden touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Client cible *</label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.entreprise})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Projet rattaché *</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850 bg-white"
              >
                <option value="">Sélectionner un projet</option>
                {projects.filter(p => p.clientId === selectedClientId).map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Type de règlement</label>
              <input
                type="text"
                placeholder="Ex : Maintenance Mensuelle..."
                value={typePaiement}
                onChange={(e) => setTypePaiement(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Montant (FCFA)</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMontant(val);
                    if (lienPaiement.includes('pay.wave.com/m/M_ci_waw-9EveeQZb')) {
                      setLienPaiement(`https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci/?amount=${val}`);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Date échéance</label>
                <input
                  type="date"
                  value={dateEcheance}
                  onChange={(e) => setDateEcheance(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Lien de paiement</label>
              <input
                type="text"
                value={lienPaiement}
                onChange={(e) => setLienPaiement(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-850"
                placeholder="https://..."
              />
            </div>

            <button
              type="button"
              onClick={handleGeneratePreview}
              className="w-full py-2.5 sm:py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg transition-colors text-sm font-semibold touch-manipulation"
            >
              Générer le texte
            </button>
          </div>

          {/* Right Column: Preview + Actions - responsive */}
          <div className="p-4 sm:p-6 md:w-1/2 flex flex-col bg-zinc-50 max-h-[40vh] md:max-h-[80vh]">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-[10px] sm:text-xs uppercase font-bold text-zinc-400 tracking-widest font-mono">
                Aperçu
              </h4>
              <button onClick={() => setIsGeneratorOpen(false)} className="text-zinc-400 hover:text-zinc-600 hidden md:block">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 border border-zinc-200 bg-white rounded-lg p-3 sm:p-4 font-sans text-xs sm:text-sm text-zinc-800 whitespace-pre-wrap select-text leading-relaxed min-h-[120px]">
              {generatedMessage || (
                <p className="text-zinc-400 italic text-center pt-8 sm:pt-20 text-xs sm:text-sm">
                  Complétez les champs et cliquez sur "Générer le texte"
                </p>
              )}
            </div>

            {generatedMessage && (
              <div className="space-y-2 sm:space-y-3 shrink-0">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCopyText}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 rounded-lg transition-colors text-[11px] sm:text-xs font-semibold text-zinc-700 touch-manipulation"
                  >
                    <Clipboard className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    {isCopied ? 'Copié !' : 'Copier le message'}
                  </button>
                  
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-[11px] sm:text-xs font-bold shadow-xs touch-manipulation"
                  >
                    <Send className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-300" />
                    Envoyer sur WhatsApp
                  </button>

                  <button
                    onClick={handleShareEmail}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-[11px] sm:text-xs font-semibold touch-manipulation"
                  >
                    <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    Envoyer par Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}
