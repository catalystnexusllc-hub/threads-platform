export interface BranchConfig {
  id: string
  abbr: string
  fullName: string
  icon: string
  accentColor: string
}

export const BRANCH_CONFIGS: Record<string, BranchConfig> = {
  arng: {
    id: 'arng',
    abbr: 'ARNG',
    fullName: 'Army National Guard',
    icon: 'fa-shield-halved',
    accentColor: '#5a7a3a',
  },
  usar: {
    id: 'usar',
    abbr: 'USAR',
    fullName: 'Army Reserve',
    icon: 'fa-shield-halved',
    accentColor: '#5a7a3a',
  },
  navy: {
    id: 'navy',
    abbr: 'USN',
    fullName: 'United States Navy',
    icon: 'fa-anchor',
    accentColor: '#1e4d8c',
  },
  marines: {
    id: 'marines',
    abbr: 'USMC',
    fullName: 'Marine Corps',
    icon: 'fa-shield-halved',
    accentColor: '#1e4d8c',
  },
  navyreserve: {
    id: 'navyreserve',
    abbr: 'USNR',
    fullName: 'Navy Reserve',
    icon: 'fa-anchor',
    accentColor: '#1e4d8c',
  },
  usmcr: {
    id: 'usmcr',
    abbr: 'USMCR',
    fullName: 'Marine Corps Reserve',
    icon: 'fa-shield-halved',
    accentColor: '#1e4d8c',
  },
  airforce: {
    id: 'airforce',
    abbr: 'USAF',
    fullName: 'Air Force',
    icon: 'fa-jet-fighter',
    accentColor: '#1a6db5',
  },
  spaceforce: {
    id: 'spaceforce',
    abbr: 'USSF',
    fullName: 'Space Force',
    icon: 'fa-satellite',
    accentColor: '#1a6db5',
  },
  ang: {
    id: 'ang',
    abbr: 'ANG',
    fullName: 'Air National Guard',
    icon: 'fa-shield-halved',
    accentColor: '#1a6db5',
  },
  afr: {
    id: 'afr',
    abbr: 'AFR',
    fullName: 'Air Force Reserve',
    icon: 'fa-shield-halved',
    accentColor: '#1a6db5',
  },
  osd: {
    id: 'osd',
    abbr: 'OSD',
    fullName: 'Office of the Secretary of Defense',
    icon: 'fa-building-columns',
    accentColor: '#6b6b6b',
  },
  jcs: {
    id: 'jcs',
    abbr: 'JCS',
    fullName: 'Joint Chiefs of Staff',
    icon: 'fa-flag-usa',
    accentColor: '#6b3fa0',
  },
  socom: {
    id: 'socom',
    abbr: 'SOCOM',
    fullName: 'Special Operations Command',
    icon: 'fa-crosshairs',
    accentColor: '#6b3fa0',
  },
  stratcom: {
    id: 'stratcom',
    abbr: 'STRATCOM',
    fullName: 'Strategic Command',
    icon: 'fa-satellite',
    accentColor: '#6b3fa0',
  },
  transcom: {
    id: 'transcom',
    abbr: 'TRANSCOM',
    fullName: 'Transportation Command',
    icon: 'fa-truck-fast',
    accentColor: '#6b3fa0',
  },
  cybercom: {
    id: 'cybercom',
    abbr: 'CYBERCOM',
    fullName: 'Cyber Command',
    icon: 'fa-network-wired',
    accentColor: '#6b3fa0',
  },
}
