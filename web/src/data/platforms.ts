import type { Platform } from '../types/platform'

export const PLATFORMS: Platform[] = [
  {
    id: 'osd',
    abbr: 'OSD',
    name: 'Office of the\nSecretary of Defense',
    icon: 'fa-building-columns',
    components: [
      { abbr: 'OSD', name: 'Office of the Secretary of Defense', icon: 'fa-building-columns', url: '/osd', badge: null },
    ],
  },
  {
    id: 'army',
    abbr: 'ARMY',
    name: 'Department\nof the Army',
    icon: 'fa-star',
    components: [
      { abbr: 'USA',  name: 'United States Army',  icon: 'fa-star',          url: '/army',  badge: 'active', imageId: 'usa'  },
      { abbr: 'ARNG', name: 'Army National Guard', icon: 'fa-shield-halved', url: '/arng',  badge: 'guard'   },
      { abbr: 'USAR', name: 'Army Reserve',        icon: 'fa-shield-halved', url: '/usar',  badge: 'reserve' },
    ],
  },
  {
    id: 'navy',
    abbr: 'NAVY',
    name: 'Department\nof the Navy',
    icon: 'fa-anchor',
    components: [
      { abbr: 'USN',   name: 'United States Navy',   icon: 'fa-anchor',        url: '/navy',        badge: 'active'  },
      { abbr: 'USMC',  name: 'Marine Corps',         icon: 'fa-shield-halved', url: '/marines',     badge: 'active'  },
      { abbr: 'USNR',  name: 'Navy Reserve',         icon: 'fa-anchor',        url: '/navyreserve', badge: 'reserve' },
      { abbr: 'USMCR', name: 'Marine Corps Reserve', icon: 'fa-shield-halved', url: '/usmcr',       badge: 'reserve' },
    ],
  },
  {
    id: 'airforce',
    abbr: 'USAF',
    name: 'Department\nof the Air Force',
    icon: 'fa-jet-fighter',
    components: [
      { abbr: 'USAF', name: 'Air Force',          icon: 'fa-jet-fighter',   url: '/airforce',   badge: 'active'  },
      { abbr: 'USSF', name: 'Space Force',        icon: 'fa-satellite',     url: '/spaceforce', badge: 'active'  },
      { abbr: 'ANG',  name: 'Air National Guard', icon: 'fa-shield-halved', url: '/ang',        badge: 'guard'   },
      { abbr: 'AFR',  name: 'Air Force Reserve',  icon: 'fa-shield-halved', url: '/afr',        badge: 'reserve' },
    ],
  },
  {
    id: 'jcs',
    abbr: 'JCS',
    name: 'Joint Chiefs\nof Staff',
    icon: 'fa-flag-usa',
    components: [
      { abbr: 'JCS',      name: 'Joint Chiefs of Staff',      icon: 'fa-flag-usa',      url: '/jcs',      badge: null    },
      { abbr: 'SOCOM',    name: 'Special Operations Command', icon: 'fa-crosshairs',    url: '/socom',    badge: 'cocom' },
      { abbr: 'STRATCOM', name: 'Strategic Command',          icon: 'fa-satellite',     url: '/stratcom', badge: 'cocom' },
      { abbr: 'TRANSCOM', name: 'Transportation Command',     icon: 'fa-truck-fast',    url: '/transcom', badge: 'cocom' },
      { abbr: 'CYBERCOM', name: 'Cyber Command',              icon: 'fa-network-wired', url: '/cybercom', badge: 'cocom' },
    ],
  },
]
