import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Clock, 
  Cpu, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { SecurityEvent, SecurityAction } from '../types';
import { fetchEventsAPI, updateEventActionAPI, deleteEventAPI } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filter States
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Forensic Inspection Modal State
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [modalityFilter, riskFilter, classFilter, actionFilter, dateFilter, sortBy, currentPage, itemsPerPage]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const list = await fetchEventsAPI({
        modality: modalityFilter,
        risk_level: riskFilter,
        action: actionFilter,
        classification: classFilter,
        search: searchQuery,
        date_filter: dateFilter,
        sort_by: sortBy,
        page: currentPage,
        limit: itemsPerPage
      });
      setEvents(list);
    } catch (e) {
      console.warn('Failed to load events from SQLite:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEvents();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setModalityFilter('ALL');
    setRiskFilter('ALL');
    setClassFilter('ALL');
    setActionFilter('ALL');
    setDateFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleAction = async (eventId: string, action: SecurityAction) => {
    await updateEventActionAPI(eventId, action);
    setEvents(prev => prev.map(evt => {
      if (evt.event_id === eventId) {
        return { ...evt, user_action: action, final_action: action };
      }
      return evt;
    }));
    if (selectedEvent?.event_id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, user_action: action, final_action: action } : null);
    }
  };

  const handleDelete = async (eventId: string) => {
    await deleteEventAPI(eventId);
    setEvents(prev => prev.filter(e => e.event_id !== eventId));
    if (selectedEvent?.event_id === eventId) {
      setSelectedEvent(null);
    }
    setDeleteConfirmId(null);
  };

  const exportFilteredCSV = () => {
    if (events.length === 0) return;
    const now = new Date().toISOString();
    const rows = [
      ['CyberShield AI — Security History & Forensic Audit Log'],
      ['Exported At', now],
      ['Filters Applied', `Modality: ${modalityFilter}, Risk: ${riskFilter}, Class: ${classFilter}, Action: ${actionFilter}, Period: ${dateFilter}`],
      ['Total Records', String(events.length)],
      [''],
      ['Event ID', 'Timestamp', 'Sender ID', 'Modality', 'Classification', 'Risk Score', 'Risk Level', 'Confidence', 'AI Model', 'Recommended Action', 'Final Action', 'Status', 'Content Preview'],
      ...events.map(e => [
        e.event_id,
        e.timestamp || e.created_at,
        `"${e.sender_id.replace(/"/g, '""')}"`,
        e.content_type,
        e.ai_result?.classification || 'SAFE',
        e.ai_result?.risk_score || 0,
        e.ai_result?.risk_level || 'LOW',
        `${Math.round((e.ai_result?.confidence || 0.95) * 100)}%`,
        e.ai_result?.model || 'sms_scam_detection_ai',
        e.ai_result?.recommendation || 'ALLOW',
        e.user_action || e.final_action || 'ALLOW',
        e.status || 'analyzed',
        `"${(e.content_preview || '').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cybershield_forensic_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side search filtering if user is typing
  const displayedEvents = searchQuery.trim() === ''
    ? events
    : events.filter(e => {
        const q = searchQuery.toLowerCase();
        return (
          e.event_id.toLowerCase().includes(q) ||
          e.sender_id.toLowerCase().includes(q) ||
          (e.ai_result?.classification && e.ai_result.classification.toLowerCase().includes(q)) ||
          e.content_type.toLowerCase().includes(q) ||
          (e.ai_result?.model && e.ai_result.model.toLowerCase().includes(q)) ||
          e.content_preview.toLowerCase().includes(q)
        );
      });

  const totalPages = Math.max(1, Math.ceil(displayedEvents.length / itemsPerPage));
  const paginatedEvents = displayedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner & Forensic Overview */}
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-green">
                <span className="live-dot" />
                IMMUTABLE AUDIT LOG
              </span>
              <span className="badge badge-blue">
                SQLITE PERSISTENT REPOSITORY
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Security History & Forensic Audit System
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '820px', marginTop: '4px', lineHeight: '1.5' }}>
              Complete chronological ledger of all intercepted communication events across 8 modalities. Inspect Explainable AI detection reasons, risk scores, full event lifecycle milestones, and user action overrides.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={exportFilteredCSV}
              className="btn btn-primary-green"
              style={{ fontSize: '0.78rem' }}
            >
              <Download size={14} /> Export Filtered CSV
            </button>
            <button 
              onClick={loadEvents}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem' }}
            >
              <RotateCcw size={14} /> Refresh Audit
            </button>
          </div>
        </div>
      </div>

      {/* 2. Multi-Filter & Search Bar */}
      <div className="cyber-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Top row: Search input & Date / Sort dropdowns */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                className="cyber-input" 
                style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
                placeholder="Search by Event ID, sender, threat, model, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-accent-blue" style={{ padding: '0 14px', fontSize: '0.78rem' }}>
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Period:</span>
              <select 
                className="cyber-input" 
                style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="24h">Today (24H)</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort:</span>
              <select 
                className="cyber-input" 
                style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_risk">Highest Risk</option>
                <option value="lowest_risk">Lowest Risk</option>
              </select>
            </div>

            <button 
              onClick={handleResetFilters}
              className="btn btn-ghost"
              style={{ fontSize: '0.72rem', padding: '4px 8px', color: 'var(--text-muted)' }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Second row: Modality, Risk, Classification, Action Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <SlidersHorizontal size={14} color="var(--color-green)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Modality:</span>
          </div>
          {['ALL', 'message', 'email', 'url', 'news', 'image', 'video', 'profile', 'file'].map((m) => (
            <button
              key={m}
              onClick={() => { setModalityFilter(m); setCurrentPage(1); }}
              className={`btn ${modalityFilter === m ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ padding: '2px 8px', fontSize: '0.68rem', textTransform: 'capitalize' }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <Filter size={14} color="var(--color-blue-light)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Risk Tier:</span>
          </div>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
            <button
              key={r}
              onClick={() => { setRiskFilter(r); setCurrentPage(1); }}
              className={`btn ${riskFilter === r ? 'btn-accent-blue' : 'btn-outline'}`}
              style={{ padding: '2px 8px', fontSize: '0.68rem' }}
            >
              {r}
            </button>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', marginRight: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Action:</span>
          </div>
          {['ALL', 'ALLOW', 'REVIEW', 'BLOCK', 'QUARANTINE'].map((a) => (
            <button
              key={a}
              onClick={() => { setActionFilter(a); setCurrentPage(1); }}
              className={`btn ${actionFilter === a ? 'btn-accent-blue' : 'btn-outline'}`}
              style={{ padding: '2px 8px', fontSize: '0.68rem' }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Forensic History Records Table */}
      <div className="cyber-card" style={{ padding: '22px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={16} color="var(--color-green)" />
            Audited Security Events ({displayedEvents.length} records)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rows per page:</span>
            <select
              className="cyber-input"
              style={{ padding: '2px 6px', fontSize: '0.72rem', width: 'auto' }}
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Loading audit records from SQLite repository...
          </div>
        ) : paginatedEvents.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Matching Audit Records Found</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '4px auto 14px auto' }}>
              No historical security events matched your search query or filter criteria.
            </p>
            <button onClick={handleResetFilters} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Event ID</th>
                <th style={{ padding: '10px 8px' }}>Timestamp</th>
                <th style={{ padding: '10px 8px' }}>Sender</th>
                <th style={{ padding: '10px 8px' }}>Modality</th>
                <th style={{ padding: '10px 8px' }}>Classification</th>
                <th style={{ padding: '10px 8px' }}>Risk Score</th>
                <th style={{ padding: '10px 8px' }}>AI Model</th>
                <th style={{ padding: '10px 8px' }}>Final Action</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Forensics</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((evt) => {
                const isSafe = evt.ai_result?.classification === 'SAFE';
                const isCrit = evt.ai_result?.risk_level === 'CRITICAL';
                const actionBadge = evt.user_action || evt.final_action || 'ALLOW';

                return (
                  <tr key={evt.event_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-blue-light)' }}>
                      {evt.event_id}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {evt.timestamp || evt.created_at?.slice(11, 19)}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.sender_id}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.58rem', textTransform: 'uppercase' }}>
                        {evt.content_type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${isSafe ? 'badge-green' : isCrit ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.62rem' }}>
                        {evt.ai_result?.classification || 'ANALYZED'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${evt.ai_result?.risk_level === 'CRITICAL' ? 'badge-danger' : evt.ai_result?.risk_level === 'HIGH' ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                        {evt.ai_result?.risk_score ?? 15}/100 ({evt.ai_result?.risk_level || 'LOW'})
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-blue-light)' }}>
                      {evt.ai_result?.model || 'sms_scam_detection_ai'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${actionBadge === 'BLOCK' ? 'badge-danger' : actionBadge === 'QUARANTINE' ? 'badge-danger' : actionBadge === 'REVIEW' ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                        {actionBadge}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="btn btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                          title="Inspect complete forensics"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(evt.event_id)}
                          className="btn btn-ghost"
                          style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}
                          title="Delete simulation event"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({displayedEvents.length} total items)
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`btn ${currentPage === pageNum ? 'btn-primary-green' : 'btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Complete Forensic Inspection Modal */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-modal-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000,
          backdropFilter: 'blur(6px)'
        }}>
          <div className="cyber-card" style={{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                  FORENSIC INSPECTION REPORT
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  Event Details: {selectedEvent.event_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem' }}
              >
                ✕ Close
              </button>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sender Identifier:</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedEvent.sender_id}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sender Persona:</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedEvent.sender_type}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Modality Channel:</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-blue-light)', textTransform: 'capitalize' }}>{selectedEvent.content_type}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target Surface:</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{selectedEvent.receiver_surface || 'Multi-App Surface'}</div>
              </div>
            </div>

            {/* Simulated Content Box */}
            <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Simulated Ingested Content:</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>
                "{selectedEvent.content_preview}"
              </div>
            </div>

            {/* AI Threat Classification Box */}
            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={15} /> AI Security Engine Assessment
                </span>
                <span className={`badge ${selectedEvent.ai_result?.risk_level === 'CRITICAL' ? 'badge-danger' : selectedEvent.ai_result?.risk_level === 'HIGH' ? 'badge-warning' : 'badge-green'}`}>
                  {selectedEvent.ai_result?.risk_level || 'LOW'} ({selectedEvent.ai_result?.risk_score ?? 15}/100)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.78rem', marginBottom: '10px' }}>
                <div><strong>AI Detector:</strong> <code style={{ color: 'var(--color-blue-light)' }}>{selectedEvent.ai_result?.model || 'sms_scam_detection_ai'}</code></div>
                <div><strong>Confidence:</strong> {Math.round((selectedEvent.ai_result?.confidence || 0.95) * 100)}%</div>
                <div><strong>Processing Latency:</strong> {selectedEvent.ai_result?.processing_time_ms || 22.4}ms</div>
                <div><strong>Recommended Action:</strong> {selectedEvent.ai_result?.recommendation || 'ALLOW'}</div>
              </div>

              {/* Explainable AI Reasons */}
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Explainable AI Detection Indicators:</span>
                <ul style={{ paddingLeft: '18px', margin: '6px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {(selectedEvent.ai_result?.reasons || selectedEvent.forensic_reasons || ['Standard verified baseline communication profile']).map((r, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Event Timeline Lifecycle */}
            {selectedEvent.timeline && selectedEvent.timeline.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Clock size={14} color="var(--color-blue-light)" /> Event Processing Lifecycle
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedEvent.timeline.map((step, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.55rem' }}>{step.status}</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{step.step}:</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{step.detail}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{step.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Agency Override Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleAction(selectedEvent.event_id, 'ALLOW')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', color: 'var(--color-green)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <CheckCircle size={13} /> Allow / Deliver
                </button>
                <button
                  onClick={() => handleAction(selectedEvent.event_id, 'BLOCK')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <XCircle size={13} /> Block Permanently
                </button>
                <button
                  onClick={() => handleAction(selectedEvent.event_id, 'QUARANTINE')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', color: 'var(--color-warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                >
                  <Lock size={13} /> Quarantine in Vault
                </button>
              </div>

              <button
                onClick={() => setDeleteConfirmId(selectedEvent.event_id)}
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}
              >
                <Trash2 size={13} /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1100
        }}>
          <div className="cyber-card" style={{ maxWidth: '420px', padding: '24px', textAlign: 'center' }}>
            <AlertTriangle size={36} color="var(--color-danger)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Confirm Audit Record Deletion
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 18px 0', lineHeight: '1.4' }}>
              Are you sure you want to delete simulation event <strong>{deleteConfirmId}</strong> from the persistent SQLite database? This action will remove its timeline and forensic milestones.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn btn-accent-danger"
                style={{ fontSize: '0.8rem' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
