import { IdCard } from 'lucide-react'
import { DetailRow, PageHeader, RoleBadge, SectionCard, VerifiedBadge } from '@/components/page'
import { useCurrentUser } from '@/features/auth/useAuth'

export function HomePage() {
  const user = useCurrentUser()
  const firstName = user.name.split(' ')[0]

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${firstName}. Here's your account at a glance.`} />

      <div className="flex flex-col gap-6 p-6">
        <SectionCard title="Your account" Icon={IdCard}>
          <dl className="divide-y">
            <DetailRow label="Name">{user.name}</DetailRow>
            <DetailRow label="Email">{user.email}</DetailRow>
            <DetailRow label="Phone">
              <span className="flex items-center gap-2">
                <span className="truncate">{user.phone}</span>
                <VerifiedBadge verified={user.phoneVerified} />
              </span>
            </DetailRow>
            <DetailRow label="Role">
              <span className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </span>
            </DetailRow>
            <DetailRow label="Member since">{new Date(user.createdAt).toLocaleDateString()}</DetailRow>
          </dl>
        </SectionCard>
      </div>
    </>
  )
}
