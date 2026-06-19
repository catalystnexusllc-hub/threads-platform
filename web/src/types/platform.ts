export type BadgeType = 'active' | 'guard' | 'reserve' | 'cocom' | null

export interface PlatformComponent {
  abbr: string
  name: string
  icon: string
  url: string
  badge: BadgeType
  imageId?: string
}

export interface Platform {
  id: string
  abbr: string
  name: string
  icon: string
  components: PlatformComponent[]
}
