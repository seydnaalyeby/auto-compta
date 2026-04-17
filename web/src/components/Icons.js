import React from 'react';

const icon = (path, viewBox = '0 0 24 24') => ({ size = 20, color = 'currentColor', style = {} } = {}) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {path}
  </svg>
);

export const IconDashboard = icon(<>
  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
</>);

export const IconPen = icon(<>
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</>);

export const IconWallet = icon(<>
  <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/>
  <path d="M16 12h6v4h-6a2 2 0 0 1 0-4z"/>
</>);

export const IconTrend = icon(<>
  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
  <polyline points="16 7 22 7 22 13"/>
</>);

export const IconBook = icon(<>
  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
</>);

export const IconFile = icon(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/>
  <line x1="16" y1="13" x2="8" y2="13"/>
  <line x1="16" y1="17" x2="8" y2="17"/>
</>);

export const IconSparkles = icon(<>
  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
  <path d="M19 3l.7 2.1 2.1.7-2.1.7L19 9l-.7-2.1L16.2 6.1l2.1-.7z" fill="currentColor" stroke="none"/>
  <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z" fill="currentColor" stroke="none"/>
</>);

export const IconBarChart = icon(<>
  <line x1="12" y1="20" x2="12" y2="10"/>
  <line x1="18" y1="20" x2="18" y2="4"/>
  <line x1="6" y1="20" x2="6" y2="16"/>
</>);

export const IconLogOut = icon(<>
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
  <polyline points="16 17 21 12 16 7"/>
  <line x1="21" y1="12" x2="9" y2="12"/>
</>);

export const IconMenu = icon(<>
  <line x1="4" y1="6" x2="20" y2="6"/>
  <line x1="4" y1="12" x2="20" y2="12"/>
  <line x1="4" y1="18" x2="20" y2="18"/>
</>);

export const IconChevronLeft  = icon(<polyline points="15 18 9 12 15 6"/>);
export const IconChevronRight = icon(<polyline points="9 18 15 12 9 6"/>);
export const IconChevronDown  = icon(<polyline points="6 9 12 15 18 9"/>);

export const IconPlus  = icon(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>);
export const IconX     = icon(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>);
export const IconCheck = icon(<polyline points="20 6 9 17 4 12"/>);

export const IconAlert = icon(<>
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</>);

export const IconArrowUpRight   = icon(<><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>);
export const IconArrowDownRight = icon(<><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></>);

export const IconBell   = icon(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>);
export const IconSearch = icon(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>);

export const IconCamera = icon(<>
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
  <circle cx="12" cy="13" r="4"/>
</>);

export const IconUpload = icon(<>
  <polyline points="16 16 12 12 8 16"/>
  <line x1="12" y1="12" x2="12" y2="21"/>
  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
</>);

export const IconActivity = icon(<>
  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
</>);

export const IconCalculator = icon(<>
  <rect x="4" y="2" width="16" height="20" rx="2"/>
  <line x1="8" y1="6" x2="16" y2="6"/>
  <line x1="8" y1="10" x2="8" y2="10" strokeWidth="2"/>
  <line x1="12" y1="10" x2="12" y2="10" strokeWidth="2"/>
  <line x1="16" y1="10" x2="16" y2="10" strokeWidth="2"/>
  <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2"/>
  <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2"/>
  <line x1="16" y1="14" x2="16" y2="14" strokeWidth="2"/>
  <line x1="8" y1="18" x2="16" y2="18" strokeWidth="2"/>
</>);

export const IconBuilding = icon(<>
  <rect x="2" y="7" width="20" height="14" rx="2"/>
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
</>);

export const IconInfo = icon(<>
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="16" x2="12" y2="12"/>
  <line x1="12" y1="8" x2="12.01" y2="8"/>
</>);

export const IconScale = icon(<>
  <line x1="12" y1="2" x2="12" y2="22"/>
  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
</>);
