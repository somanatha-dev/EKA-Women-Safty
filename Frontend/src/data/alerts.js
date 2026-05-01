import { AlertTriangle, Navigation, Phone, Mic } from 'lucide-react';

export const RECENT_ALERTS = [
  {
    id: 1,
    type: 'danger',
    title: 'High-Risk Zone Entered',
    message: 'Sector 4 Industrial Area',
    time: '2 mins ago',
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Unusual Path Deviation',
    message: 'Moved 200m off standard route',
    time: '15 mins ago',
    icon: Navigation,
  },
  {
    id: 3,
    type: 'success',
    title: 'Fake Call Sequence',
    message: 'Completed safely and dismissed',
    time: '1 hour ago',
    icon: Phone,
  },
  {
    id: 4,
    type: 'warning',
    title: 'Voice Trigger Adjusted',
    message: 'Sensitivity increased to High',
    time: '3 hours ago',
    icon: Mic,
  },
];
