import React from 'react';

/**
 * סט אייקונים דו-צבעוני (duotone) מעוצב משלנו - בסגנון ידידותי ומעוגל.
 * כל אייקון משתמש בצבע אחד (color) ובגוון בהיר שלו לשכבת הרקע.
 * שימוש: <Icon name="math" size={40} color="#51cf66" />
 */

const icons = {
  typing: (c) => (
    <>
      <rect x="2" y="6" width="20" height="13" rx="3.2" fill={c} fillOpacity="0.22" />
      <g fill={c}>
        {[4.8, 8, 11.2, 14.4, 17.6].map((x) => (
          <rect key={'a' + x} x={x} y="9" width="2" height="2" rx="0.7" />
        ))}
        {[4.8, 8, 11.2, 14.4, 17.6].map((x) => (
          <rect key={'b' + x} x={x} y="12" width="2" height="2" rx="0.7" />
        ))}
        <rect x="7" y="15.2" width="10" height="2" rx="1" />
      </g>
    </>
  ),
  letters: (c) => (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill={c} fillOpacity="0.22" />
      <text
        x="12"
        y="13"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Varela Round', sans-serif"
        fontSize="13"
        fill={c}
      >
        א
      </text>
    </>
  ),
  reading: (c) => (
    <>
      <path d="M12 6.2C9 4.6 5.4 4.6 3.2 6v12c2.2-1.4 5.8-1.4 8.8.2Z" fill={c} fillOpacity="0.25" />
      <path d="M12 6.2c3-1.6 6.6-1.6 8.8-.2v12c-2.2-1.4-5.8-1.4-8.8.2Z" fill={c} />
    </>
  ),
  math: (c) => (
    <>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.5" fill={c} fillOpacity="0.22" />
      <g fill={c}>
        <rect x="6" y="10.3" width="5" height="1.8" rx="0.9" />
        <rect x="7.6" y="8.7" width="1.8" height="5" rx="0.9" />
        <rect x="13" y="8" width="4.6" height="1.7" rx="0.85" />
        <circle cx="14.1" cy="14.4" r="1" />
        <circle cx="16.6" cy="14.4" r="1" />
      </g>
    </>
  ),
  english: (c) => (
    <>
      <circle cx="12" cy="12" r="8.6" fill={c} fillOpacity="0.2" />
      <g fill="none" stroke={c} strokeWidth="1.5">
        <circle cx="12" cy="12" r="8.6" />
        <ellipse cx="12" cy="12" rx="4.1" ry="8.6" />
        <line x1="3.6" y1="12" x2="20.4" y2="12" />
        <line x1="5.2" y1="7.6" x2="18.8" y2="7.6" />
        <line x1="5.2" y1="16.4" x2="18.8" y2="16.4" />
      </g>
    </>
  ),
  science: (c) => (
    <>
      <path
        d="M10 3.4h4v6l4.7 8.4a2 2 0 0 1-1.75 3H7.05a2 2 0 0 1-1.75-3L10 9.4Z"
        fill={c}
        fillOpacity="0.25"
      />
      <g fill={c}>
        <rect x="9" y="2.4" width="6" height="1.9" rx="0.95" />
        <circle cx="11" cy="16.4" r="1" />
        <circle cx="14" cy="18.2" r="0.85" />
        <circle cx="12.7" cy="14.2" r="0.7" />
      </g>
    </>
  ),
  music: (c) => (
    <>
      <ellipse cx="8.6" cy="17" rx="3.7" ry="3" fill={c} fillOpacity="0.22" />
      <g fill={c}>
        <ellipse cx="8.6" cy="17" rx="3" ry="2.4" />
        <rect x="11" y="5" width="1.8" height="12.3" rx="0.9" />
        <path d="M12.8 5c3.4 1 5 2.8 4.4 6 0-2-1.6-3.2-4.4-3.2Z" />
      </g>
    </>
  ),
  art: (c) => (
    <>
      <path
        d="M12 3.6c-5.2 0-8.6 3.4-8.6 8 0 3.7 3 5.7 6 5.2 1.3-.2 1.8-1.7 1.1-2.8-.7-1.2.1-2.5 1.6-2.5H16c2.9 0 5-2 5-5 0-3.6-4-5.9-9-5.9Z"
        fill={c}
        fillOpacity="0.25"
      />
      <g fill={c}>
        <circle cx="7.6" cy="10.4" r="1.15" />
        <circle cx="11" cy="7.8" r="1.15" />
        <circle cx="15" cy="8.6" r="1.15" />
        <circle cx="16.8" cy="12" r="1.15" />
      </g>
    </>
  ),
  trophy: (c) => (
    <>
      <path d="M6 4h12v4.5a6 6 0 0 1-12 0Z" fill={c} fillOpacity="0.25" />
      <g fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 5H3.4v1.5a3 3 0 0 0 3 3" />
        <path d="M18 5h2.6v1.5a3 3 0 0 1-3 3" />
      </g>
      <g fill={c}>
        <path d="M6 4h12v4a6 6 0 0 1-12 0Z" fillOpacity="0.55" />
        <rect x="11" y="12.6" width="2" height="3.4" rx="0.4" />
        <rect x="7.6" y="16" width="8.8" height="2.6" rx="1.1" />
      </g>
    </>
  ),
  home: (c) => (
    <>
      <path d="M4 11.2 12 4l8 7.2V20a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20Z" fill={c} fillOpacity="0.22" />
      <g fill={c}>
        <path d="M2.6 11.6 12 3.2l9.4 8.4a1 1 0 0 1-1.34 1.48L12 5.9l-8.06 7.18A1 1 0 0 1 2.6 11.6Z" />
        <rect x="9.6" y="14" width="4.8" height="6.4" rx="1" />
      </g>
    </>
  ),
  user: (c) => (
    <>
      <circle cx="12" cy="8" r="4.2" fill={c} fillOpacity="0.25" />
      <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0 1.2 1.2 0 0 1-1.2 1.2H5.7a1.2 1.2 0 0 1-1.2-1.2Z" fill={c} fillOpacity="0.25" />
      <g fill={c}>
        <circle cx="12" cy="8" r="3.1" />
      </g>
    </>
  ),
  sprout: (c) => (
    <>
      <path d="M12 20c0-6-4-9-8.4-9 0 5.2 4 8.2 8.4 9Z" fill={c} fillOpacity="0.32" />
      <g fill={c}>
        <path d="M12 20c0-7 4-11 8.4-11 0 6.2-4 10.2-8.4 11Z" />
        <rect x="11.2" y="11" width="1.6" height="9" rx="0.8" />
      </g>
    </>
  ),
  share: (c) => (
    <>
      <g stroke={c} strokeWidth="1.7" strokeLinecap="round" opacity="0.45">
        <line x1="8.2" y1="11" x2="15" y2="7" />
        <line x1="8.2" y1="13" x2="15" y2="17" />
      </g>
      <g fill={c}>
        <circle cx="6" cy="12" r="2.6" />
        <circle cx="17" cy="6" r="2.6" />
        <circle cx="17" cy="18" r="2.6" />
      </g>
    </>
  ),
};

export default function Icon({ name, size = 40, color = '#5b6cf9', className, style }) {
  const render = icons[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {render ? render(color) : null}
    </svg>
  );
}

export const hasIcon = (name) => Boolean(icons[name]);
