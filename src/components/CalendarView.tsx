import React, { useState } from 'react';
import { Client, Project, Contract, Payment } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface CalendarViewProps {
  clients: Client[];
  projects: Project[];
  contracts: Contract[];
  payments: Payment[];
}

export default function CalendarView({ clients, projects, contracts, payments }: CalendarViewProps) {
  // Use current local time for pre-population (from metadata, 2026-07-09)
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-07-09'));

  // Get start of month and days in month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  // Convert Sunday-first to Monday-first for standard European/African layout
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Helper to check if a date is today (based on 2026-07-09)
  const isToday = (dayNum: number) => {
    const today = new Date('2026-07-09');
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === dayNum;
  };

  // Build list of events for each day of this month
  const getEventsForDay = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayEvents: any[] = [];

    // 1. Paid historical payments on this day
    payments.forEach(p => {
      if (p.datePaiement === dateStr) {
        const client = clients.find(c => c.id === p.clientId);
        const proj = projects.find(pr => pr.id === p.projetId);
        dayEvents.push({
          id: `pay-${p.id}`,
          type: 'paid',
          title: p.type === 'site' ? `Revenu Site : ${proj?.nom || 'Projet'}` : `Revenu Maintenance`,
          client: client?.nom || 'Client inconnu',
          entreprise: client?.entreprise || '',
          amount: p.montant,
          details: p.commentaire || p.moyenPaiement
        });
      }
    });

    // 2. Active contract maintenance deadlines on this day
    contracts.forEach(c => {
      if (c.prochaineEcheance === dateStr && c.statut === 'Actif') {
        const client = clients.find(cl => cl.id === c.clientId);
        const proj = projects.find(pr => pr.id === c.projetId);
        
        // Determine if it was already paid (if there is a payment of type 'maintenance' associated with this contract close to this date)
        // For simplicity, if next deadline is in the past, it's overdue. If next is in the future, it's upcoming soon.
        const todayStr = '2026-07-09';
        const isOverdue = dateStr < todayStr;
        const diffTime = new Date(dateStr).getTime() - new Date(todayStr).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isSoon = diffDays >= 0 && diffDays <= 7;

        dayEvents.push({
          id: `contract-${c.id}`,
          type: isOverdue ? 'overdue' : (isSoon ? 'soon' : 'future'),
          title: `Maintenance : ${proj?.nom || 'Site'}`,
          client: client?.nom || 'Client inconnu',
          entreprise: client?.entreprise || '',
          amount: c.montant,
          details: `Fréquence: ${c.frequence}`
        });
      }
    });

    return dayEvents;
  };

  const [selectedDay, setSelectedDay] = useState<number | null>(9); // Default to July 9

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="calendar-view-section">
      {/* Calendar Grid card */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Calendrier des échéances</h2>
              <p className="text-xs text-zinc-500">Visualisez et anticipez les renouvellements</p>
            </div>
          </div>
         <div className="flex items-center gap-1">
  <button
    onClick={handlePrevMonth}
    className="p-1.5 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors text-zinc-600"
    title="Mois précédent"
  >
    <ChevronLeft className="w-4 h-4" />
  </button>

  <span className="font-medium text-sm text-zinc-800 whitespace-nowrap">
    {monthNames[month]} {year}
  </span>

  <button
    onClick={handleNextMonth}
    className="p-1.5 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors text-zinc-600"
    title="Mois suivant"
  >
    <ChevronRight className="w-4 h-4" />
  </button>
</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="text-xs font-semibold text-zinc-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {/* Leading empty slots */}
          {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square bg-zinc-50/50 rounded-lg border border-zinc-100/40"></div>
          ))}

          {/* Actual days of month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const events = getEventsForDay(dayNum);
            const isSelected = selectedDay === dayNum;
            const isDayToday = isToday(dayNum);

            // Determine day badge color based on events
            const hasOverdue = events.some(e => e.type === 'overdue');
            const hasSoon = events.some(e => e.type === 'soon');
            const hasPaid = events.some(e => e.type === 'paid');

            let dotColor = '';
            let ringColor = '';
            if (hasOverdue) {
              dotColor = 'bg-rose-500';
              ringColor = 'ring-rose-500/20';
            } else if (hasSoon) {
              dotColor = 'bg-amber-500';
              ringColor = 'ring-amber-500/20';
            } else if (hasPaid) {
              dotColor = 'bg-emerald-500';
              ringColor = 'ring-emerald-500/20';
            }

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay(dayNum)}
                className={`aspect-square relative flex flex-col items-center justify-between p-1.5 rounded-lg border transition-all text-left group
                  ${isSelected 
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs' 
                    : isDayToday
                      ? 'bg-amber-50/50 border-amber-300 text-zinc-950 font-semibold'
                      : 'bg-white border-zinc-100 hover:border-zinc-300 text-zinc-700'
                  }
                `}
              >
                <span className="text-xs font-medium">{dayNum}</span>
                
                {/* Event Indicator Dot */}
                {events.length > 0 && (
                  <div className="flex gap-1 justify-center w-full mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor || 'bg-zinc-400'}`}></span>
                    {events.length > 1 && (
                      <span className="text-[9px] leading-none text-zinc-400 font-bold group-hover:text-zinc-600">
                        +{events.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-zinc-100 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Payé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Échéance bientôt (&le; 7j)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Retard</span>
          </div>
        </div>
      </div>

      {/* Selected Day Agenda details card */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Événements du {selectedDay ? `${selectedDay} ${monthNames[month]} ${year}` : ''}
        </h3>

        {selectedDayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="w-8 h-8 text-zinc-300 mb-2" />
            <p className="text-zinc-500 text-sm">Aucune échéance ni paiement enregistré pour cette date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDayEvents.map((ev, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-2 transition-all
                  ${ev.type === 'paid' 
                    ? 'bg-emerald-50/40 border-emerald-100/80 text-emerald-950' 
                    : ev.type === 'overdue'
                      ? 'bg-rose-50/40 border-rose-100/80 text-rose-950'
                      : 'bg-amber-50/40 border-amber-100/80 text-amber-950'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mb-1.5
                      ${ev.type === 'paid' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : ev.type === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }
                    `}>
                      {ev.type === 'paid' && <CheckCircle className="w-3 h-3" />}
                      {ev.type === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                      {ev.type === 'soon' && <Clock className="w-3 h-3" />}
                      {ev.type === 'paid' ? 'Encaissement' : ev.type === 'overdue' ? 'RETARD' : 'À Venir'}
                    </span>
                    <h4 className="font-medium text-sm text-zinc-900">{ev.title}</h4>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{ev.client} ({ev.entreprise})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold block font-mono text-zinc-900">
                      {ev.amount.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>{ev.details}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
