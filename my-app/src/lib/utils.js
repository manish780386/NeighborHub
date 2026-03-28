import { formatDistanceToNow, format } from 'date-fns'
import { clsx } from 'clsx'

export const cn = (...args) => clsx(...args)

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true })

export const formatDate = (date, fmt = 'dd MMM yyyy') =>
  format(new Date(date), fmt)

export const POST_TYPES = {
  help:  { label: 'Help',       color: 'bg-red-50 text-red-700 border-red-100' },
  lost:  { label: 'Lost & Found', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  event: { label: 'Event',      color: 'bg-blue-50 text-blue-700 border-blue-100' },
  sale:  { label: 'Sale',       color: 'bg-brand-50 text-brand-700 border-brand-100' },
  alert: { label: 'Alert',      color: 'bg-orange-50 text-orange-700 border-orange-100' },
}

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const distanceLabel = (meters) => {
  if (!meters) return ''
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}