import { format } from 'date-fns';

export default function formatDate(dateString: string) {
  return format(new Date(dateString), 'MMM, dd yyyy');
}
