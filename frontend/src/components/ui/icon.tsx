import type { CSSProperties } from 'react';

type IconName =
  | 'search' | 'plus' | 'mic' | 'stop' | 'play' | 'folder' | 'tag' | 'spark'
  | 'back' | 'chevR' | 'chevD' | 'more' | 'moreV' | 'check' | 'x' | 'trash'
  | 'edit' | 'home' | 'doc' | 'clock' | 'filter' | 'move' | 'wave' | 'google';

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
}

/** Thin, rounded stroked glyphs — ported from the Hi-Fi icon set (data.jsx). */
export function Icon({ name, size = 20, stroke = 1.7, className, style }: IconProps) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
  };
  switch (name) {
    case 'search': return (<svg {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>);
    case 'plus': return (<svg {...p}><path d="M12 5v14M5 12h14" /></svg>);
    case 'mic': return (<svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
    case 'stop': return (<svg {...p}><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>);
    case 'play': return (<svg {...p}><path d="M8 5.5v13l11-6.5z" /></svg>);
    case 'folder': return (<svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>);
    case 'tag': return (<svg {...p}><path d="M4 4h7l9 9-7 7-9-9z" /><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" /></svg>);
    case 'spark': return (<svg {...p}><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" /></svg>);
    case 'back': return (<svg {...p}><path d="M15 5l-7 7 7 7" /></svg>);
    case 'chevR': return (<svg {...p}><path d="M9 5l7 7-7 7" /></svg>);
    case 'chevD': return (<svg {...p}><path d="M5 9l7 7 7-7" /></svg>);
    case 'more': return (<svg {...p}><circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" /></svg>);
    case 'moreV': return (<svg {...p}><circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" /></svg>);
    case 'check': return (<svg {...p}><path d="M5 12.5l4.5 4.5L19 6.5" /></svg>);
    case 'x': return (<svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
    case 'trash': return (<svg {...p}><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" /></svg>);
    case 'edit': return (<svg {...p}><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17z" /><path d="M14 7l3 3" /></svg>);
    case 'home': return (<svg {...p}><path d="M4 11l8-7 8 7M6 9.5V20h12V9.5" /></svg>);
    case 'doc': return (<svg {...p}><path d="M7 3h7l5 5v13H7z" fill="none" /><path d="M14 3v5h5M9.5 13h5M9.5 16.5h5" /></svg>);
    case 'clock': return (<svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
    case 'filter': return (<svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>);
    case 'move': return (<svg {...p}><path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4" /></svg>);
    case 'wave': return (<svg {...p}><path d="M4 12h2M9 7v10M14 4v16M19 9v6M21 11v2" /></svg>);
    case 'google': return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className}>
        <path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.36-.18-2H12v3.79h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.31z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A9.99 9.99 0 0 0 12 22z" />
        <path fill="#FBBC05" d="M6.41 13.9a6 6 0 0 1 0-3.8V7.51H3.07a10 10 0 0 0 0 8.98z" />
        <path fill="#EA4335" d="M12 6.58c1.47 0 2.78.5 3.82 1.5l2.85-2.85C16.96 3.6 14.7 2.7 12 2.7A9.99 9.99 0 0 0 3.07 7.5l3.34 2.6C7.2 8.34 9.4 6.58 12 6.58z" />
      </svg>
    );
    default: return (<svg {...p}><circle cx="12" cy="12" r="8" /></svg>);
  }
}
