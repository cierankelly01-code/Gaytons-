import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount) =>
  `£${Number(amount || 0).toFixed(2)}`;

export const formatDate = (date) =>
  date ? format(new Date(date), 'd MMM yyyy') : '—';

export const formatDateTime = (date) =>
  date ? format(new Date(date), 'd MMM yyyy, HH:mm') : '—';

export const formatRelative = (date) =>
  date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : '—';

export const formatDeliveryDate = (date) =>
  date ? format(new Date(date), 'EEEE, d MMMM yyyy') : '—';

export const statusLabel = (status) => {
  const map = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PICKED: 'Picked',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status;
};

export const categoryLabel = (cat) => {
  const map = {
    BREADS_WHITE: 'White Breads',
    BREADS_BROWN: 'Brown Breads',
    BREADS_MALTED: 'Malted Breads',
    BREADS_SOURDOUGH: 'Sourdough',
    ROLLS_BATCHES: 'Rolls & Batches',
    ROLLS_BURGERS: 'Burgers',
    ROLLS_SUBS: 'Subs & French',
    CAKES_INDIVIDUAL: 'Individual Cakes',
    CAKES_TRAYBAKE: 'Traybakes',
    CAKES_CATERER: 'Caterer Cakes',
    PASTRIES_SWEET: 'Pastries & Slices',
    PASTRIES_SAVOURY: 'Savouries',
    PIES: 'Pies',
    SCONES_TEACAKES: 'Scones & Teacakes',
  };
  return map[cat] || cat;
};
