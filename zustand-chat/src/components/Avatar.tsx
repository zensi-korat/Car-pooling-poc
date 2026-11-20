import type { Profile } from '../protocol'
import { AVATAR } from './profileStyles'

export function Avatar({ profile }: Readonly<{ profile: Profile }>) {
  return (
    <span
      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${AVATAR[profile.colour]}`}
    >
      {profile.name[0].toUpperCase()}
    </span>
  )
}
