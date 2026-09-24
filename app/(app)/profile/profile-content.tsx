'use client';

import React, { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { useTheme } from '@/app/components/theme-provider';
import { updateProfile } from '@/app/actions/auth';
import type { Session, UserProfileDto } from '@/app/lib/types';
import { ChangePasswordModal } from './change-password-modal';

// ── Country + City Data ──────────────────────────────────────────────
const COUNTRIES: { code: string; name: string; cities: string[] }[] = [
  { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington D.C.', 'Nashville', 'Oklahoma City', 'El Paso', 'Boston', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Mesa', 'Sacramento', 'Atlanta', 'Kansas City', 'Colorado Springs', 'Omaha', 'Raleigh', 'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tampa', 'Tulsa', 'Arlington', 'New Orleans'] },
  { code: 'GB', name: 'United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Leicester', 'Cardiff', 'Belfast', 'Nottingham', 'Newcastle', 'Brighton', 'Southampton', 'Oxford', 'Cambridge', 'York', 'Bath'] },
  { code: 'IN', name: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Noida', 'Gurgaon', 'Chandigarh', 'Coimbatore', 'Kochi'] },
  { code: 'DE', name: 'Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg'] },
  { code: 'FR', name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Grenoble'] },
  { code: 'CA', name: 'Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'Victoria', 'Halifax', 'London', 'St. John\'s'] },
  { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Hobart', 'Darwin'] },
  { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'] },
  { code: 'SG', name: 'Singapore', cities: ['Singapore'] },
  { code: 'AE', name: 'United Arab Emirates', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
  { code: 'BR', name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'] },
  { code: 'KR', name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan'] },
  { code: 'IL', name: 'Israel', cities: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beer Sheva'] },
  { code: 'NL', name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere'] },
  { code: 'SE', name: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Linköping', 'Västerås'] },
  { code: 'CH', name: 'Switzerland', cities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne'] },
  { code: 'IE', name: 'Ireland', cities: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford'] },
  { code: 'NZ', name: 'New Zealand', cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'] },
  { code: 'ES', name: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Málaga', 'Zaragoza'] },
  { code: 'IT', name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice'] },
  { code: 'MX', name: 'Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Cancún'] },
  { code: 'PL', name: 'Poland', cities: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk'] },
  { code: 'NO', name: 'Norway', cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen'] },
  { code: 'DK', name: 'Denmark', cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'] },
  { code: 'FI', name: 'Finland', cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku'] },
  { code: 'AT', name: 'Austria', cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'] },
  { code: 'PT', name: 'Portugal', cities: ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Funchal'] },
  { code: 'ZA', name: 'South Africa', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
  { code: 'TH', name: 'Thailand', cities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Hat Yai'] },
  { code: 'PH', name: 'Philippines', cities: ['Manila', 'Quezon City', 'Davao', 'Cebu City', 'Zamboanga'] },
  { code: 'CN', name: 'China', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an', 'Nanjing', 'Tianjin'] },
  { code: 'RU', name: 'Russia', cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan'] },
  { code: 'AR', name: 'Argentina', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'] },
  { code: 'CL', name: 'Chile', cities: ['Santiago', 'Valparaíso', 'Concepción', 'Temuco', 'Antofagasta'] },
  { code: 'CO', name: 'Colombia', cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'] },
  { code: 'EG', name: 'Egypt', cities: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'] },
  { code: 'NG', name: 'Nigeria', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'] },
  { code: 'KE', name: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },
  { code: 'SA', name: 'Saudi Arabia', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'] },
  { code: 'MY', name: 'Malaysia', cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Malacca'] },
  { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Bali'] },
  { code: 'VN', name: 'Vietnam', cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho'] },
  { code: 'TW', name: 'Taiwan', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Hsinchu'] },
  { code: 'HK', name: 'Hong Kong', cities: ['Hong Kong'] },
  { code: 'BD', name: 'Bangladesh', cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'] },
  { code: 'PK', name: 'Pakistan', cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'] },
  { code: 'LK', name: 'Sri Lanka', cities: ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo'] },
  { code: 'NP', name: 'Nepal', cities: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Biratnagar', 'Bharatpur'] },
].sort((a, b) => a.name.localeCompare(b.name));

// ── Social Platform Options ──────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  { id: 'website', label: 'Website', prefix: 'https://', icon: 'globe' as const },
  { id: 'github', label: 'GitHub', prefix: 'https://github.com/', icon: 'code' as const },
  { id: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/', icon: 'user' as const },
  { id: 'twitter', label: 'X (Twitter)', prefix: 'https://x.com/', icon: 'arrow' as const },
  { id: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/', icon: 'user' as const },
  { id: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/@', icon: 'activity' as const },
  { id: 'dribbble', label: 'Dribbble', prefix: 'https://dribbble.com/', icon: 'activity' as const },
  { id: 'mastodon', label: 'Mastodon', prefix: 'https://', icon: 'globe' as const },
  { id: 'bluesky', label: 'Bluesky', prefix: 'https://bsky.app/profile/', icon: 'globe' as const },
  { id: 'threads', label: 'Threads', prefix: 'https://threads.net/@', icon: 'arrow' as const },
];

interface SocialLink {
  platform: string;
  url: string;
}

function validateSocialUrl(url: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:') || lower.startsWith('vbscript:')) {
    return false;
  }
  try {
    const candidate = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    const u = new URL(candidate);
    return u.protocol === 'https:' && u.hostname.includes('.');
  } catch {
    return false;
  }
}

// Parse existing profile social data into SocialLink[] format
function parseLegacySocials(user?: UserProfileDto): SocialLink[] {
  if (user?.socialLinks) {
    try {
      const parsed = typeof user.socialLinks === 'string' ? JSON.parse(user.socialLinks) : user.socialLinks;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fall through to legacy parsing
    }
  }
  const links: SocialLink[] = [];
  if (user?.website) links.push({ platform: 'website', url: user.website });
  if (user?.github) links.push({ platform: 'github', url: user.github.startsWith('http') ? user.github : `https://github.com/${user.github.replace('@', '')}` });
  if (user?.linkedin) links.push({ platform: 'linkedin', url: user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}` });
  if (user?.xTwitter) links.push({ platform: 'twitter', url: user.xTwitter.startsWith('http') ? user.xTwitter : `https://x.com/${user.xTwitter.replace('@', '')}` });
  if (user?.instagram) links.push({ platform: 'instagram', url: user.instagram.startsWith('http') ? user.instagram : `https://instagram.com/${user.instagram.replace('@', '')}` });
  return links;
}

// ── Custom DOB Picker Component ──────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseDobParts(val: string) {
  if (!val) return null;
  const parts = val.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { year: y, month: m, day: d };
    }
  }
  return null;
}

function CustomDatePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse current value safely without UTC shifts
  const parsed = parseDobParts(value);
  const currentYear = new Date().getFullYear();
  const minYear = 1920;
  const maxYear = currentYear - 18;

  const [viewYear, setViewYear] = useState(parsed ? parsed.year : maxYear);
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.month : 0);
  const [pickerMode, setPickerMode] = useState<'calendar' | 'month' | 'year'>('calendar');

  const selectedYear = parsed ? parsed.year : null;
  const selectedMonth = parsed ? parsed.month : null;
  const selectedDay = parsed ? parsed.day : null;

  // Sync view if value changes
  useEffect(() => {
    const p = parseDobParts(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setPickerMode('calendar');
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPickerMode('calendar');
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setIsOpen(false);
    setPickerMode('calendar');
    triggerHaptic('selection');
  };

  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          triggerHaptic('tap');
          setIsOpen(!isOpen);
          setPickerMode('calendar');
        }}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[13px] text-left focus:outline-none focus:border-[var(--accent-blue)] transition-colors flex items-center justify-between cursor-pointer disabled:opacity-50"
      >
        <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>
          {parsed
            ? `${MONTHS[parsed.month]} ${parsed.day}, ${parsed.year}`
            : 'Select date of birth…'}
        </span>
        <Icon name="sliders" size={14} className="text-[var(--text-tertiary)]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[320px] p-4 rounded-2xl liquid-glass-dropdown shadow-2xl border border-[var(--border-strong)] z-50 animate-fade">
          {/* Year Picker Mode */}
          {pickerMode === 'year' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">Select Year</span>
                <button
                  type="button"
                  onClick={() => setPickerMode('calendar')}
                  className="text-[12px] text-[var(--accent-blue)] font-medium hover:underline cursor-pointer"
                >
                  Back to Calendar
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-[240px] overflow-y-auto custom-scrollbar">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewYear(y);
                      setPickerMode('calendar');
                      triggerHaptic('tap');
                    }}
                    className={`py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                      y === viewYear
                        ? 'bg-[var(--accent-blue)] text-white'
                        : y === selectedYear
                          ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Month Picker Mode */}
          {pickerMode === 'month' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">Select Month</span>
                <button
                  type="button"
                  onClick={() => setPickerMode('calendar')}
                  className="text-[12px] text-[var(--accent-blue)] font-medium hover:underline cursor-pointer"
                >
                  Back to Calendar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((mName, idx) => (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setViewMonth(idx);
                      setPickerMode('calendar');
                      triggerHaptic('tap');
                    }}
                    className={`py-2 px-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer text-center ${
                      idx === viewMonth
                        ? 'bg-[var(--accent-blue)] text-white'
                        : idx === selectedMonth && viewYear === selectedYear
                          ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {mName.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Day Mode */}
          {pickerMode === 'calendar' && (
            <>
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
                    else setViewMonth(viewMonth - 1);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] cursor-pointer transition-colors"
                >
                  ‹
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setPickerMode('month');
                    }}
                    className="text-[13px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue)] cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[var(--surface-hover)]"
                  >
                    {MONTHS[viewMonth]}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setPickerMode('year');
                    }}
                    className="text-[13px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue)] cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[var(--surface-hover)]"
                  >
                    {viewYear}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
                    else setViewMonth(viewMonth + 1);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] cursor-pointer transition-colors"
                >
                  ›
                </button>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-[10px] font-semibold text-[var(--text-tertiary)] text-center py-1 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = viewYear === selectedYear && viewMonth === selectedMonth && day === selectedDay;
                  const isToday = viewYear === currentYear && viewMonth === new Date().getMonth() && day === new Date().getDate();
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`w-full aspect-square rounded-lg text-[12px] font-medium flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-blue)] text-white shadow-sm'
                          : isToday
                            ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]'
                            : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Searchable Select Component ──────────────────────────────────────
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
          triggerHaptic('tap');
        }}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[13px] text-left focus:outline-none focus:border-[var(--accent-blue)] transition-colors flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="sliders" size={14} className="text-[var(--text-tertiary)]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl liquid-glass-dropdown shadow-2xl border border-[var(--border-strong)] z-50 animate-fade overflow-hidden">
          <div className="p-2 border-b border-[var(--border-hairline)]">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full px-3 py-1.5 rounded-lg bg-[var(--well)] text-[12px] text-[var(--text-primary)] border border-[var(--border-hairline)] focus:outline-none focus:border-[var(--accent-blue)]"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {filtered.length > 0 ? filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                  triggerHaptic('selection');
                }}
                className={`w-full px-3 py-1.5 rounded-lg text-[12px] text-left transition-colors cursor-pointer ${
                  o.value === value
                    ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] font-medium'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {o.label}
              </button>
            )) : (
              <div className="px-3 py-2 text-[11px] text-[var(--text-tertiary)] text-center">
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Profile Content ─────────────────────────────────────────────
interface ProfileContentProps {
  session: Session;
  initialUser?: UserProfileDto;
}

export default function ProfileContent({ session, initialUser }: ProfileContentProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'sessions'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Profile Form States
  const [name, setName] = useState(initialUser?.name || session.name || '');
  const [username, setUsername] = useState(initialUser?.username || session.username || '');
  const [bio, setBio] = useState(initialUser?.bio || '');
  const [dob, setDob] = useState(initialUser?.dob || '');
  const [avatarUrl, setAvatarUrl] = useState(initialUser?.avatarUrl || session.avatarUrl || '');

  // Country + City location
  const [countryCode, setCountryCode] = useState('');
  const [city, setCity] = useState('');

  // Parse existing location into country+city
  useEffect(() => {
    if (initialUser?.location) {
      const loc = initialUser.location;
      // Try to match "City, Country" format
      const parts = loc.split(',').map((s: string) => s.trim());
      if (parts.length === 2) {
        const countryMatch = COUNTRIES.find((c) => c.name.toLowerCase() === parts[1].toLowerCase() || c.code.toLowerCase() === parts[1].toLowerCase());
        if (countryMatch) {
          setCountryCode(countryMatch.code);
          setCity(parts[0]);
          return;
        }
      }
      // Try matching just country name
      const directMatch = COUNTRIES.find((c) => c.name.toLowerCase() === loc.toLowerCase());
      if (directMatch) {
        setCountryCode(directMatch.code);
      }
    }
  }, [initialUser?.location]);

  // Dynamic social links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    parseLegacySocials(initialUser)
  );

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const usernameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Security state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Connected Accounts state
  const [connectedAccounts, setConnectedAccounts] = useState<
    Array<{ id: string; provider: 'google' | 'apple'; email?: string | null; name?: string | null }>
  >([]);

  useEffect(() => {
    fetch('/api/user/connected-accounts')
      .then((r) => r.json())
      .then((d) => {
        if (d.accounts) setConnectedAccounts(d.accounts);
      })
      .catch(() => {});
  }, []);

  // Toast / feedback state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Calculate age from DOB safely
  const calculateAge = (dobString: string): number | null => {
    const parsed = parseDobParts(dobString);
    if (!parsed) return null;
    const today = new Date();
    let age = today.getFullYear() - parsed.year;
    const monthDiff = today.getMonth() - parsed.month;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.day)) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(dob);

  // Username availability check with debounce
  const checkUsername = useCallback((val: string) => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);

    if (!val || val.length < 3) {
      setUsernameStatus(val ? 'invalid' : 'idle');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(val)) {
      setUsernameStatus('invalid');
      return;
    }
    if (val.length > 30) {
      setUsernameStatus('invalid');
      return;
    }

    // If unchanged from current user's username, don't check
    if (val === (initialUser?.username || '').toLowerCase()) {
      setUsernameStatus('available');
      return;
    }

    setUsernameStatus('checking');
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(val)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
  }, [initialUser?.username]);

  // Handle avatar file upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setToast(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        triggerHaptic('selection');
        setToast({ type: 'success', message: 'Profile photo updated successfully' });
        router.refresh();
      } else {
        triggerHaptic('critical');
        setToast({ type: 'error', message: data.error || 'Failed to upload photo' });
      }
    } catch {
      triggerHaptic('critical');
      setToast({ type: 'error', message: 'Failed to upload photo' });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    try {
      const res = await fetch('/api/upload/avatar', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAvatarUrl('');
        triggerHaptic('selection');
        setToast({ type: 'success', message: 'Profile photo removed' });
        router.refresh();
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to remove photo' });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Social links management
  const addSocialLink = () => {
    if (socialLinks.length >= 10) return;
    const usedPlatforms = socialLinks.map((l) => l.platform);
    const nextPlatform = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.includes(p.id));
    setSocialLinks([...socialLinks, { platform: nextPlatform?.id || 'website', url: '' }]);
    triggerHaptic('tap');
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
    triggerHaptic('tap');
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  // Handle save
  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerHaptic('tap');
    setToast(null);

    // Client-side age validation
    if (calculatedAge !== null && calculatedAge < 18) {
      triggerHaptic('critical');
      setToast({
        type: 'error',
        message: 'Age verification failed: Operators must be at least 18 years of age.',
      });
      return;
    }

    // Validate social URLs
    for (const link of socialLinks) {
      if (link.url && !validateSocialUrl(link.url)) {
        triggerHaptic('critical');
        setToast({
          type: 'error',
          message: `Invalid URL for ${SOCIAL_PLATFORMS.find((p) => p.id === link.platform)?.label || link.platform}. Only http/https URLs are allowed.`,
        });
        return;
      }
    }

    // Username validation
    if (username && usernameStatus === 'taken') {
      triggerHaptic('critical');
      setToast({ type: 'error', message: 'Username is already taken. Please choose another.' });
      return;
    }

    // Build location string
    const country = COUNTRIES.find((c) => c.code === countryCode);
    const locationStr = country ? (city ? `${city}, ${country.name}` : country.name) : '';

    // Convert social links back to legacy format for now
    const websiteLink = socialLinks.find((l) => l.platform === 'website');
    const githubLink = socialLinks.find((l) => l.platform === 'github');
    const linkedinLink = socialLinks.find((l) => l.platform === 'linkedin');
    const twitterLink = socialLinks.find((l) => l.platform === 'twitter');
    const instagramLink = socialLinks.find((l) => l.platform === 'instagram');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('dob', dob);
    formData.append('avatarUrl', avatarUrl);
    formData.append('website', websiteLink?.url || '');
    formData.append('github', githubLink?.url || '');
    formData.append('linkedin', linkedinLink?.url || '');
    formData.append('instagram', instagramLink?.url || '');
    formData.append('xTwitter', twitterLink?.url || '');
    formData.append('location', locationStr);
    formData.append('socialLinks', JSON.stringify(socialLinks));

    startTransition(async () => {
      const res = await updateProfile(undefined, formData);
      if (res?.success) {
        triggerHaptic('selection');
        setToast({ type: 'success', message: res.message || 'Profile saved successfully' });
        setIsEditing(false);
        router.refresh();
      } else {
        triggerHaptic('critical');
        setToast({ type: 'error', message: res?.error || 'Failed to update profile' });
      }
    });
  };

  const handleDisconnectProvider = async (provider: 'google' | 'apple') => {
    triggerHaptic('tap');
    try {
      const res = await fetch('/api/user/connected-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: 'error', message: data.error || `Failed to unlink ${provider}` });
      } else {
        setConnectedAccounts((prev) => prev.filter((a) => a.provider !== provider));
        setToast({ type: 'success', message: data.message || `Unlinked ${provider} account.` });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: `Network error unlinking ${provider}` });
    }
  };

  const avatarInitials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'OP';

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);
  const cityOptions = selectedCountry?.cities.map((c) => ({ value: c, label: c })) || [];
  const countryOptions = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

  // Get display location
  const displayLocation = selectedCountry
    ? (city ? `${city}, ${selectedCountry.name}` : selectedCountry.name)
    : (initialUser?.location || '');

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8 pb-28 min-w-0 w-full">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6 min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
            Account Management
          </span>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            Account &amp; Profile
          </h1>
          <p className="text-[13px] sm:text-[13.5px] text-[var(--text-secondary)] mt-1">
            Manage your personal identity, biometric passkeys, preferences, and active security sessions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {(session.role === 'owner' || session.role === 'admin') && (
            <Link
              href="/owner"
              onClick={() => triggerHaptic('selection')}
              className="btn-primary text-[12.5px] h-8.5 px-3.5"
            >
              <Icon name="shield" size={14} />
              <span>{session.role === 'owner' ? 'Owner Control Center' : 'Admin Centre'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Inline Toast Notification ──────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate-fade ${
            toast.type === 'success'
              ? 'bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] text-[var(--status-safe)]'
              : 'bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-[13px] font-medium">
            <Icon name={toast.type === 'success' ? 'check' : 'close'} size={16} />
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[11px] font-medium opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 4 Segmented Account Sections ────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] w-full max-w-full sm:max-w-md select-none overflow-x-auto no-scrollbar">
        {(['profile', 'security', 'preferences', 'sessions'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab(tab);
            }}
            className={`flex-1 min-w-[70px] py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[12.5px] font-medium transition-all capitalize cursor-pointer text-center whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] shadow-xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Profile ──────────────────────────────────────────────────── */}
      <div className={activeTab === 'profile' ? 'space-y-6 animate-fade min-w-0' : 'hidden'}>
          {/* Hero Profile Card */}
          <div className="liquid-glass-card p-4 sm:p-6 lg:p-8 rounded-[28px] sm:rounded-[32px] border border-[var(--border-hairline)] space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-w-0">
              <div className="flex items-center gap-3.5 sm:gap-5 min-w-0 flex-1">
                {/* Avatar Display with Upload */}
                <div className="relative group shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md border-2 border-[var(--border-hairline)]"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[var(--accent-blue)] to-[#a3c7f4] flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-md border-2 border-[var(--border-hairline)]">
                      {avatarInitials}
                    </div>
                  )}

                  {/* Photo overlay on hover */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {avatarUploading ? (
                      <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <Icon name="settings" size={18} className="text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight truncate max-w-full">
                      {name || 'Security Operator'}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border ${
                        session.role === 'owner'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : session.role === 'admin'
                          ? 'bg-[var(--status-safe)]/10 text-[var(--status-safe)] border-[var(--status-safe)]/20'
                          : 'bg-[var(--well)] text-[var(--text-secondary)] border-[var(--border-hairline)]'
                      }`}
                    >
                      {session.role === 'owner' ? '★ Owner' : session.role === 'admin' ? '🛡 Admin' : 'User'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] sm:text-[13px] min-w-0">
                    <span className="font-mono text-[var(--accent-blue)] font-medium shrink-0">
                      @{username || 'operator'}
                    </span>
                    <span className="text-[var(--text-tertiary)] shrink-0">•</span>
                    <span className="font-mono text-[var(--text-secondary)] break-all truncate">{session.email}</span>
                  </div>

                  {displayLocation && (
                    <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] pt-0.5 min-w-0">
                      <Icon name="globe" size={13} className="shrink-0" />
                      <span className="truncate">{displayLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                    className="btn-secondary text-[12px] h-9 px-3 text-[var(--status-critical)]"
                  >
                    Remove Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setIsEditing((prev) => !prev);
                  }}
                  className="btn-primary text-[13px] h-9.5 px-5"
                >
                  <Icon name="settings" size={14} />
                  <span>{isEditing ? 'Close Editor' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>

            {/* Bio */}
            {bio ? (
              <div className="p-4 rounded-2xl bg-[var(--surface-solid)]/70 border border-[var(--border-hairline)] text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                &ldquo;{bio}&rdquo;
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--surface-solid)]/40 border border-[var(--border-hairline)] text-[12.5px] text-[var(--text-tertiary)] italic">
                No bio provided. Click &ldquo;Edit Profile&rdquo; to describe your operational responsibilities.
              </div>
            )}

            {/* Social Links & Verification Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--border-hairline)] text-[12px]">
              {/* Date of Birth & Age Verification */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--well)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                <Icon name="lock" size={12} className="text-[var(--status-safe)]" />
                <span>
                  {calculatedAge !== null
                    ? `18+ Verified (${calculatedAge} yrs, DOB Private)`
                    : 'DOB (Private): Pending Declaration'}
                </span>
              </div>

              {socialLinks.filter((l) => l.url).map((link, i) => {
                const platform = SOCIAL_PLATFORMS.find((p) => p.id === link.platform);
                const label = platform?.label || link.platform;
                const url = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                return (
                  <a
                    key={`${link.platform}-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-solid)] border border-[var(--border-hairline)] hover:border-[var(--accent-blue)] text-[var(--text-primary)] transition-colors"
                  >
                    <Icon name={platform?.icon || 'globe'} size={12} className="text-[var(--accent-blue)]" />
                    <span>{label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Edit Profile Drawer / Form */}
          {isEditing && (
            <div className="bento-card p-6 sm:p-8 space-y-6 animate-fade">
              <div className="border-b border-[var(--border-hairline)] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
                    Edit Operator Profile
                  </h3>
                  <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5">
                    Update your public handle, bio, date of birth, and social endpoints.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Profile Picture Uploader */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[var(--border-hairline)] relative bg-gradient-to-tr from-[var(--accent-blue)] to-[#a3c7f4] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{avatarInitials}</span>
                        )}
                        {avatarUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">Profile Photo</h4>
                        <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                          Upload avatar image (JPEG, PNG, WebP or GIF, up to 5MB).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="btn-primary text-[12px] h-8.5 px-3.5 cursor-pointer"
                      >
                        <Icon name="sliders" size={13} />
                        <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                      </button>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={avatarUploading}
                          className="btn-secondary text-[12px] h-8.5 px-3 text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] cursor-pointer"
                        >
                          <Icon name="close" size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                    />
                  </div>

                  {/* Username with real-time availability */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Unique @username
                      </label>
                      {usernameStatus === 'checking' && (
                        <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full border border-[var(--text-tertiary)] border-t-transparent animate-spin" />
                          Checking…
                        </span>
                      )}
                      {usernameStatus === 'available' && username && (
                        <span className="text-[10px] text-[var(--status-safe)] font-semibold flex items-center gap-1">
                          <Icon name="check" size={10} /> Available
                        </span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-[10px] text-[var(--status-critical)] font-semibold flex items-center gap-1">
                          <Icon name="close" size={10} /> Taken
                        </span>
                      )}
                      {usernameStatus === 'invalid' && username && (
                        <span className="text-[10px] text-[var(--status-warning)] font-semibold">
                          3-30 chars, a-z 0-9 _
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-[13px] text-[var(--text-tertiary)]">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                          setUsername(val);
                          checkUsername(val);
                        }}
                        required
                        placeholder="handle"
                        className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[var(--surface-solid)] border text-[13px] text-[var(--text-primary)] focus:outline-none font-mono transition-colors ${
                          usernameStatus === 'taken'
                            ? 'border-[var(--status-critical)] focus:border-[var(--status-critical)]'
                            : usernameStatus === 'available' && username
                              ? 'border-[var(--status-safe)] focus:border-[var(--status-safe)]'
                              : 'border-[var(--border-hairline)] focus:border-[var(--accent-blue)]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Date of Birth (Custom Liquid Glass Picker) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Date of Birth (18+ Verification)
                      </label>
                      {calculatedAge !== null && (
                        <span
                          className={`text-[11px] font-medium ${
                            calculatedAge >= 18
                              ? 'text-[var(--status-safe)]'
                              : 'text-[var(--status-critical)]'
                          }`}
                        >
                          {calculatedAge >= 18
                            ? `Eligible (${calculatedAge} yrs)`
                            : `Under 18 (${calculatedAge} yrs)`}
                        </span>
                      )}
                    </div>
                    <CustomDatePicker
                      value={dob}
                      onChange={setDob}
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                      Country
                    </label>
                    <SearchableSelect
                      options={countryOptions}
                      value={countryCode}
                      onChange={(val) => {
                        setCountryCode(val);
                        setCity(''); // Reset city when country changes
                      }}
                      placeholder="Select country…"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                      City
                    </label>
                    <SearchableSelect
                      options={cityOptions}
                      value={city}
                      onChange={setCity}
                      placeholder={countryCode ? 'Select city…' : 'Select country first'}
                      disabled={!countryCode}
                    />
                  </div>

                  {/* Bio */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Operator Biography
                      </label>
                      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                        {bio.length} / 500
                      </span>
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Brief overview of your role, agent containment scope, and security focus..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                    />
                  </div>

                  {/* ── Dynamic Social Links ────────────────────────── */}
                  <div className="sm:col-span-2 space-y-3 pt-2 border-t border-[var(--border-hairline)]">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Social Links
                      </label>
                      <button
                        type="button"
                        onClick={addSocialLink}
                        disabled={socialLinks.length >= 10}
                        className="text-[12px] text-[var(--accent-blue)] font-medium hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span className="text-[14px] leading-none">+</span>
                        <span>Add Social</span>
                      </button>
                    </div>

                    {socialLinks.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-[var(--surface-solid)]/40 border border-[var(--border-hairline)] text-[12px] text-[var(--text-tertiary)] italic text-center">
                        No social links added yet. Click &ldquo;+ Add Social&rdquo; to get started.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {socialLinks.map((link, index) => {
                          const urlValid = validateSocialUrl(link.url);
                          return (
                            <div key={index} className="flex items-center gap-2">
                              {/* Platform selector */}
                              <select
                                value={link.platform}
                                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                                className="w-[140px] px-2.5 py-2 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] cursor-pointer shrink-0 appearance-none"
                              >
                                {SOCIAL_PLATFORMS.map((p) => (
                                  <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                              </select>

                              {/* URL input */}
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                                placeholder={SOCIAL_PLATFORMS.find((p) => p.id === link.platform)?.prefix || 'https://'}
                                className={`flex-1 px-3 py-2 rounded-xl bg-[var(--surface-solid)] border text-[12px] text-[var(--text-primary)] font-mono focus:outline-none transition-colors ${
                                  link.url && !urlValid
                                    ? 'border-[var(--status-critical)] focus:border-[var(--status-critical)]'
                                    : 'border-[var(--border-hairline)] focus:border-[var(--accent-blue)]'
                                }`}
                              />

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => removeSocialLink(index)}
                                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] transition-colors cursor-pointer"
                              >
                                <Icon name="close" size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-hairline)]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary text-[12.5px] h-9 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || usernameStatus === 'taken' || (calculatedAge !== null && calculatedAge < 18)}
                    className="btn-primary text-[12.5px] h-9 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
      </div>

      {/* ── TAB 2: Security & Authentication ─────────────────────────────────── */}
      <div className={activeTab === 'security' ? 'space-y-6 animate-fade' : 'hidden'}>
        {/* 1. Account Password Card */}
        <div className="bento-card p-6 sm:p-8 space-y-4">
          <div className="border-b border-[var(--border-hairline)] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
                Authentication Credentials
              </span>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-0.5">
                Master Password
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                Manage your primary account password used for enclave access.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setIsPasswordModalOpen(true);
              }}
              className="btn-primary text-[13px] h-9 px-4.5 self-start sm:self-auto cursor-pointer shadow-sm"
            >
              <Icon name="lock" size={14} />
              <span>Change Password</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-secondary)]">
                <Icon name="lock" size={16} />
              </div>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  Operator Password
                </div>
                <div className="text-[11.5px] text-[var(--text-tertiary)]">
                  Secured with salted bcrypt hash (cost 10)
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)]">
              CONFIGURED
            </span>
          </div>
        </div>

        {/* 2. Two-Step Verification Card */}
        <div className="bento-card p-6 sm:p-8 space-y-4">
          <div className="border-b border-[var(--border-hairline)] pb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
              Multi-Factor Authentication
            </span>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-0.5">
              Two-Step Verification
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1">
              Sentinel enforces email-based one-time verification codes (OTP) for all password sign-ins.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)] flex items-center justify-center">
                <Icon name="shield" size={16} />
              </div>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  Email verification code
                </div>
                <div className="text-[11.5px] text-[var(--text-tertiary)] font-mono">
                  Dispatched via transactional email to {session.email}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
              ENABLED
            </span>
          </div>
        </div>

        {/* 3. WebAuthn Passkeys Card */}
        <div className="bento-card p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
                Passwordless Authentication
              </span>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-0.5">
                Biometric Passkeys &amp; FIDO2
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                Authenticate instantly using Touch ID, Face ID, or a hardware security key.
              </p>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
              NOT CONFIGURED
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center">
                  <Icon name="shield" size={16} />
                </div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    Passkey authentication unavailable
                  </div>
                  <div className="text-[11.5px] text-[var(--text-tertiary)]">
                    Server-side WebAuthn verification and credential storage are not configured.
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)]">
                DISABLED
              </span>
            </div>
          </div>
        </div>

        {/* 4. Connected Accounts Card */}
        <div className="bento-card p-6 sm:p-8 space-y-4">
          <div className="border-b border-[var(--border-hairline)] pb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
                  Identity Federation
                </span>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-0.5">
                  Connected Accounts &amp; SSO
                </h3>
                <p className="text-[12.5px] text-[var(--text-secondary)] mt-1">
                  Single Sign-On providers linked to this operator identity.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                {connectedAccounts.length} Linked
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Google */}
            {(() => {
              const googleAccount = connectedAccounts.find((a) => a.provider === 'google');
              return (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[13px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.25C.45 8.15 0 9.97 0 12s.45 3.85 1.25 5.44l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.56l4.03 3.15c.95-2.83 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">Google Workspace</div>
                      <div className="text-[11.5px] text-[var(--text-tertiary)]">
                        {googleAccount ? googleAccount.email || 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>

                  {googleAccount ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnectProvider('google')}
                      className="text-[12px] font-medium text-[var(--status-critical)] hover:underline px-2 py-1 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <a
                      href="/api/auth/google"
                      className="btn-secondary text-[12px] h-8 px-3.5 inline-flex items-center"
                    >
                      Connect
                    </a>
                  )}
                </div>
              );
            })()}

            {/* Apple */}
            {(() => {
              const appleAccount = connectedAccounts.find((a) => a.provider === 'apple');
              return (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[13px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-current text-[var(--text-primary)]" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.64-2.2.52-3.06-.4C3.79 16.17 4.36 9.51 8.82 9.28c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.3 4.11zM12.03 9.2C11.88 7.16 13.5 5.5 15.4 5.35c.28 2.35-2.15 4.12-3.37 3.85z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">Apple ID</div>
                      <div className="text-[11.5px] text-[var(--text-tertiary)]">
                        {appleAccount ? appleAccount.email || 'Connected' : 'Not configured • Requires Apple Developer Program'}
                      </div>
                    </div>
                  </div>

                  {appleAccount ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnectProvider('apple')}
                      className="text-[12px] font-medium text-[var(--status-critical)] hover:underline px-2 py-1 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)] px-2.5 py-1 rounded-lg bg-[var(--well)] border border-[var(--border-hairline)]">
                      UNAVAILABLE
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* 5. Active Sessions Summary Card */}
        <div className="bento-card p-6 sm:p-8 space-y-4">
          <div className="border-b border-[var(--border-hairline)] pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
                Session Lifecycle
              </span>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-0.5">
                Active Security Sessions
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-1">
                Cryptographic JWT sessions authenticated for this device.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('sessions');
              }}
              className="text-[12px] text-[var(--accent-blue)] font-medium hover:underline cursor-pointer"
            >
              View All Sessions →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--well)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--accent-blue)]">
                <Icon name="lock" size={16} />
              </div>
              <div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span>Current Browser Session</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)]">
                    THIS DEVICE
                  </span>
                </div>
                <div className="text-[11.5px] text-[var(--text-tertiary)] font-mono">
                  Operator: {session.email} • Role: {session.role} • Expires in 7 days
                </div>
              </div>
            </div>

            <span className="text-[11px] font-mono text-[var(--status-safe)] font-semibold">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* ── TAB 3: Preferences ──────────────────────────────────────────────── */}
      <div className={activeTab === 'preferences' ? 'space-y-6 animate-fade' : 'hidden'}>
        <div className="bento-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-[var(--border-hairline)] pb-4">
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Display &amp; System Preferences
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1">
              Customize appearance, haptic feedback, and notification frequency.
            </p>
          </div>

          <div className="space-y-5 divide-y divide-[var(--border-hairline)]">
            {/* Theme */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-medium text-[var(--text-primary)] block">Appearance Theme</span>
                <span className="text-[12px] text-[var(--text-secondary)]">Choose macOS graphite dark or Cupertino clean light</span>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setTheme('dark');
                  }}
                  className={`segmented-pill ${resolvedTheme === 'dark' ? 'is-active' : ''}`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setTheme('light');
                  }}
                  className={`segmented-pill ${resolvedTheme === 'light' ? 'is-active' : ''}`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* Haptic Motion */}
            <div className="pt-5 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-medium text-[var(--text-primary)] block">Tactile Haptics</span>
                <span className="text-[12px] text-[var(--text-secondary)]">Physical micro-scale responses on interactive controls</span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--status-safe-subtle)] text-[var(--status-safe)]">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 4: Active Sessions ──────────────────────────────────────────── */}
      <div className={activeTab === 'sessions' ? 'space-y-6 animate-fade' : 'hidden'}>
          <div className="bento-card p-6 sm:p-8 space-y-5">
            <div className="border-b border-[var(--border-hairline)] pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                  Active Login Sessions
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                  Enclave sessions authenticated with HMAC-SHA256 JWT tokens.
                </p>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  onClick={() => triggerHaptic('tap')}
                  className="btn-secondary text-[12px] text-[var(--status-critical)] h-8.5 px-3.5 cursor-pointer"
                >
                  Sign Out of Current Device
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--well)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--accent-blue)]">
                    <Icon name="lock" size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <span>Current Browser Session</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)]">
                        THIS DEVICE
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[var(--text-tertiary)] font-mono">
                      User: {session.email} • Role: {session.role} • Expires in 7 days
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[var(--status-safe)] font-semibold">
                  ACTIVE
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={(msg) => setToast({ type: 'success', message: msg })}
        userEmail={session.email}
      />
    </div>
  );
}
