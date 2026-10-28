import apiRequest from '../api';
import { LIVE } from './sources';
import { adaptPaymentsList } from './adapters/paymentAdapter';
import { paymentsStats as mockStats, invoicesData as mockInvoices } from '../../features/portal/data/payments';

export const getPayments = async ({ search = '' } = {}) => {
  if (!LIVE.payments) {
    let list = [...mockInvoices];
    if (search?.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((p) => p.title?.toLowerCase().includes(q));
    }
    return {
      count: list.length,
      payments: list,
      stats: mockStats
    };
  }

  const raw = await apiRequest('/user/payments', {
    params: { search: search?.trim() || undefined }
  });

  return adaptPaymentsList(raw);
};
