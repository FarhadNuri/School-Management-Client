import { useState, useMemo, useEffect } from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import Tag from '../components/Tag';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import ErrorRetry from '../components/ErrorRetry';
import { usePayments, useDebounce } from '../hooks/usePortalQueries';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  GraduationCap,
  ExternalLink,
  Download,
  RotateCw,
  Eye,
  X
} from 'lucide-react';

export default function Payments() {
  const { flags } = usePortalRole();
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'paid', 'overdue'
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  const effectiveSearch = activeSearch !== '' ? activeSearch : debouncedSearch;

  const { data, isLoading, isError, error, refetch, isFetching } = usePayments(effectiveSearch);

  // Close modal on Escape key press
  useEffect(() => {
    if (!selectedPayment) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedPayment(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPayment]);

  const handleSearchSubmit = (val) => {
    setActiveSearch(val);
  };

  const handleInputChange = (val) => {
    setSearchInput(val);
    if (activeSearch !== '') {
      setActiveSearch('');
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await refetch();
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const payments = data?.payments || [];
  const stats = data?.stats || {
    outstanding: '$0.00',
    paid: '$0.00',
    openInvoices: 0,
    overdue: 0
  };

  const filteredPayments = useMemo(() => {
    let list = [...payments];

    if (statusFilter !== 'all') {
      list = list.filter((inv) => {
        const sKey = String(inv.statusKey || '').toLowerCase();
        const sDisplay = String(inv.status || '').toLowerCase();
        const isPaid = sKey === 'paid' || sDisplay === 'paid';
        const isOverdue = Boolean(inv.isOverdue) || sDisplay === 'overdue';

        if (statusFilter === 'paid') return isPaid;
        if (statusFilter === 'overdue') return isOverdue && !isPaid;
        if (statusFilter === 'pending') return (sKey === 'pending' || sDisplay === 'pending' || !sKey) && !isOverdue && !isPaid;
        return true;
      });
    }

    return list;
  }, [payments, statusFilter]);

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' }
  ];

  return (
    <>
      <div className="pt" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2>Payments</h2>
          <p>Track invoices and payments for your students</p>
        </div>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isFetching || isSyncing}
          className="ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isFetching || isSyncing ? 'not-allowed' : 'pointer',
            opacity: isFetching || isSyncing ? 0.7 : 1,
            transition: 'all 0.15s ease',
            height: '38px',
            whiteSpace: 'nowrap'
          }}
          title="Sync payment statuses with Stripe"
        >
          <RotateCw
            size={14}
            style={{
              animation: isFetching || isSyncing ? 'spin 1s linear infinite' : 'none',
              transformOrigin: 'center'
            }}
          />
          <span>{isFetching || isSyncing ? 'Checking Stripe...' : 'Sync Status'}</span>
        </button>
      </div>

      {/* Computed Tiles: Outstanding, Paid, Open Invoices, Overdue */}
      <div className="st4">
        <StatCard label="OUTSTANDING" value={stats.outstanding} className="tr" />
        <StatCard label="PAID TO DATE" value={stats.paid} className="tg2" />
        <StatCard label="OPEN INVOICES" value={String(stats.openInvoices)} className="ta" />
        <StatCard label="OVERDUE" value={String(stats.overdue)} className="tbl" />
      </div>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search by student, title, ID, or receipt..."
        value={searchInput}
        onChange={handleInputChange}
        onSearch={handleSearchSubmit}
      />

      {/* Filter Options: All, Pending, Paid, Overdue */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: statusFilter === tab.id ? 'var(--p1)' : 'var(--card)',
              color: statusFilter === tab.id ? '#fff' : 'var(--ink)',
              border: statusFilter === tab.id ? '1px solid var(--p1)' : '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ margin: '14px 0', color: 'var(--g-mute, #60797F)', fontSize: '13.5px' }}>
        Showing <b style={{ color: 'var(--g-ink, #0A1C24)' }}>{filteredPayments.length}</b> invoice{filteredPayments.length === 1 ? '' : 's'}
      </div>

      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {[1, 2].map((n) => (
            <div key={n} className="cd" style={{ padding: '22px', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width="90px" height="24px" borderRadius="10px" />
                <Skeleton width="70px" height="24px" borderRadius="10px" />
              </div>
              <Skeleton width="180px" height="22px" />
              <Skeleton width="130px" height="16px" />
              <Skeleton width="100%" height="80px" borderRadius="14px" />
              <Skeleton width="100%" height="40px" borderRadius="12px" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load payment invoices.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filteredPayments.length === 0 && (
        <EmptyState
          title={statusFilter === 'all' && !effectiveSearch ? 'No invoices yet' : 'No matching invoices'}
          message={
            effectiveSearch || statusFilter !== 'all'
              ? 'No invoices match your selected filter or search query.'
              : 'Invoices from the school will appear here.'
          }
        />
      )}

      {!isLoading && !isError && filteredPayments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredPayments.map((inv) => {
            const isPaid = inv.status === 'paid';
            const isOverdue = Boolean(inv.isOverdue);
            const statusColor = isPaid ? 'g' : isOverdue ? 'r' : 'a';

            return (
              <div
                key={inv.id}
                className="cd"
                style={{
                  padding: '22px',
                  borderRadius: '20px',
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--sh)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Header Row: Purpose Pill on left & Status Badge on right (Raw Stripe code removed) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <Tag>{(inv.purpose || 'TUITION').toUpperCase()}</Tag>

                  <Tag color={statusColor}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {isPaid && <CheckCircle2 size={12} />}
                      {isOverdue && <AlertCircle size={12} />}
                      {!isPaid && !isOverdue && <Clock size={12} />}
                      {inv.status?.toUpperCase()}
                    </span>
                  </Tag>
                </div>

                {/* Title & Student Meta */}
                <div>
                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontSize: '17px',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}
                  >
                    {inv.title}
                  </h3>

                  {inv.studentName && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: 'var(--mute)'
                      }}
                    >
                      <GraduationCap size={15} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{inv.studentName}</span>
                      {inv.classGrade && (
                        <span style={{ opacity: 0.75, fontSize: '12px' }}>• {inv.classGrade}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Structured Financial Breakdown Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: 'var(--mute)',
                        marginBottom: '4px',
                        fontWeight: 700
                      }}
                    >
                      Total Billed
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
                      {inv.amountFormatted}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: 'var(--mute)',
                        marginBottom: '4px',
                        fontWeight: 700
                      }}
                    >
                      Balance Due
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: isPaid ? '#22C55E' : isOverdue ? '#EF4444' : '#F59E0B'
                      }}
                    >
                      {inv.balanceFormatted}
                    </div>
                  </div>

                  {/* Date Status Row - "Settled Online" removed, real date formatted */}
                  <div
                    style={{
                      gridColumn: 'span 2',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '12px'
                    }}
                  >
                    {isPaid ? (
                      <span style={{ color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Paid on {inv.paidDate && inv.paidDate !== '—' ? inv.paidDate : (inv.dueDate || '27 Oct 2026')}
                      </span>
                    ) : (
                      <span style={{ color: isOverdue ? '#DC2626' : 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} style={{ color: isOverdue ? '#DC2626' : 'var(--p1)' }} />
                        <span>Due: <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{inv.dueDate}</b></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Area: View Details + Download/Pay */}
                <div style={{ marginTop: 'auto', paddingTop: '4px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setSelectedPayment(inv)}
                    style={{
                      flex: 1,
                      height: '40px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>

                  {isPaid ? (
                    inv.receiptUrl && (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => window.open(inv.receiptUrl, '_blank', 'noopener,noreferrer')}
                        style={{
                          flex: 1,
                          height: '40px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          color: 'var(--p1)',
                          transition: 'all 0.15s ease'
                        }}
                        title="Download official receipt / invoice"
                      >
                        <Download size={14} />
                        <span>Download</span>
                        <ExternalLink size={12} style={{ opacity: 0.6 }} />
                      </button>
                    )
                  ) : flags.canPay && inv.payUrl ? (
                    <button
                      type="button"
                      className="pb"
                      onClick={() => window.open(inv.payUrl, '_blank', 'noopener,noreferrer')}
                      style={{
                        flex: 1.2,
                        height: '40px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(30, 111, 120, 0.25)'
                      }}
                    >
                      <CreditCard size={14} />
                      <span>Pay invoice</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Details Modal matching admin design */}
      {selectedPayment && (
        <div
          className="md on"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPayment(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="mc" style={{ width: '560px', maxWidth: '92vw', borderRadius: '24px' }}>
            {/* Modal Header */}
            <div className="mh">
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{selectedPayment.title}</h3>
                <p style={{ margin: '3px 0 0', fontSize: '13px', opacity: 0.85 }}>
                  Invoice #{selectedPayment.id?.slice(-8)}
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedPayment(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb" style={{ display: 'grid', gap: '16px' }}>
              {/* Badges & Due Date row */}
              <div className="row" style={{ alignItems: 'center' }}>
                <Tag
                  color={
                    selectedPayment.status === 'paid'
                      ? 'g'
                      : selectedPayment.isOverdue
                      ? 'a'
                      : ''
                  }
                >
                  {selectedPayment.status === 'paid'
                    ? 'Paid'
                    : selectedPayment.isOverdue
                    ? 'Overdue'
                    : 'Pending'}
                </Tag>
                <Tag>{selectedPayment.feeType || selectedPayment.purpose || 'Tuition'}</Tag>
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--mute)' }}>
                  Due {selectedPayment.dueDate}
                </span>
              </div>

              {/* Participant Info Box */}
              <div
                className="cd"
                style={{
                  background: 'var(--bg)',
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'grid',
                  gap: '8px'
                }}
              >
                <div className="row">
                  <span style={{ color: 'var(--mute)', fontSize: '13px' }}>Billed student:</span>
                  <b style={{ marginLeft: 'auto' }}>{selectedPayment.studentName}</b>
                </div>
                <div className="row">
                  <span style={{ color: 'var(--mute)', fontSize: '13px' }}>Guardian contact:</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {selectedPayment.guardianName}{' '}
                    {selectedPayment.guardianEmail ? `(${selectedPayment.guardianEmail})` : ''}
                  </span>
                </div>
                <div className="row">
                  <span style={{ color: 'var(--mute)', fontSize: '13px' }}>Issued date:</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {selectedPayment.issuedDate || selectedPayment.createdAt || '27 Oct 2026'}
                  </span>
                </div>
                {selectedPayment.paidDate && selectedPayment.status === 'paid' && (
                  <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--mute)', fontSize: '13px' }}>Paid date:</span>
                    <span style={{ marginLeft: 'auto', color: '#23895B', fontWeight: 600 }}>
                      {selectedPayment.paidDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Financial Breakdown */}
              <div
                className="cd"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'grid',
                  gap: '10px'
                }}
              >
                <div className="row">
                  <span>Total Amount</span>
                  <b style={{ marginLeft: 'auto' }}>
                    {selectedPayment.currency || 'USD'} {selectedPayment.rawAmount?.toLocaleString() || selectedPayment.amount}
                  </b>
                </div>
                <div className="row">
                  <span style={{ color: 'var(--mute)' }}>Amount Paid</span>
                  <span style={{ marginLeft: 'auto', color: '#23895B' }}>
                    {selectedPayment.currency || 'USD'} {selectedPayment.amountPaid?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                  <b>Outstanding Balance</b>
                  <b
                    style={{
                      marginLeft: 'auto',
                      color: selectedPayment.balance > 0 ? '#C23A52' : '#23895B'
                    }}
                  >
                    {selectedPayment.currency || 'USD'} {selectedPayment.balance?.toLocaleString() || 0}
                  </b>
                </div>
              </div>

              {selectedPayment.notes && selectedPayment.notes !== '—' && (
                <div style={{ fontSize: '13px', color: 'var(--mute)' }}>
                  <b>Notes:</b> {selectedPayment.notes}
                </div>
              )}

              {/* Action Buttons: Download option & Pay option */}
              <div className="row" style={{ gap: '10px', marginTop: '6px' }}>
                {selectedPayment.receiptUrl && (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => window.open(selectedPayment.receiptUrl, '_blank', 'noopener,noreferrer')}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={15} style={{ color: 'var(--p1)' }} />
                    <span>Download Invoice / Receipt</span>
                    <ExternalLink size={13} style={{ opacity: 0.6 }} />
                  </button>
                )}

                {selectedPayment.status !== 'paid' && flags.canPay && selectedPayment.payUrl && (
                  <button
                    type="button"
                    className="pb"
                    onClick={() => window.open(selectedPayment.payUrl, '_blank', 'noopener,noreferrer')}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <CreditCard size={15} />
                    <span>Pay invoice ({selectedPayment.balanceFormatted})</span>
                    <ExternalLink size={13} style={{ opacity: 0.8 }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
