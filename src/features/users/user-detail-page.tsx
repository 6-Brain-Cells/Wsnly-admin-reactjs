import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Power,
  Save,
  Shield,
  ShieldAlert,
  User as UserIcon,
  Users as UsersIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { editUserSchema, type EditUserInput } from '@/features/auth/schemas'
import { useAuthStore } from '@/features/auth/store'
import { useChangeRole, useDeactivateUser, useUpdateUser, useUser } from './hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/shared/error-state'
import { KPICard } from '@/components/charts/kpi-card'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useSetLayoutTitle } from '@/lib/layout-context'
import { GENDERS, ROLES } from '@/constants/enums'
import { ROUTES } from '@/constants/routes'
import { formatDateTime, initialsFromName } from '@/lib/format'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const { data: user, isLoading, isError, error, refetch } = useUser(id ?? '')
  const updateUser = useUpdateUser(id ?? '')
  const deactivateUser = useDeactivateUser()
  const changeRole = useChangeRole()

  const [editOpen, setEditOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState<
    typeof ROLES.ADMIN | typeof ROLES.USER
  >(ROLES.USER)

  const form = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    values: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_number: user.mobile_number ?? '',
          address: user.address ?? '',
          gender: (user.gender as EditUserInput['gender']) ?? undefined,
          role: user.role,
          is_active: user.is_active,
        }
      : undefined,
  })

  useEffect(() => {
    if (user) {
      setPendingRole(user.role)
    }
  }, [user])

  useDocumentTitle(user ? `${user.first_name} ${user.last_name}` : undefined)
  useSetLayoutTitle(
    user ? `${user.first_name} ${user.last_name}` : null,
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(ROUTES.users)}>
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Button>
        <ErrorState
          message={(error as Error)?.message ?? 'User not found'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const isSelf = currentUser?.id === user.id
  const fullName = `${user.first_name} ${user.last_name}`

  const onSave = (values: EditUserInput) => {
    updateUser.mutate(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        mobile_number: values.mobile_number || undefined,
        address: values.address || undefined,
        gender: values.gender,
        role: values.role,
        is_active: values.is_active,
      },
      {
        onSuccess: () => {
          toast.success('User updated')
          setEditOpen(false)
        },
        onError: (err: { message?: string }) =>
          toast.error(err.message ?? 'Failed to update user'),
      },
    )
  }

  const onChangeRole = () => {
    changeRole.mutate(
      { userId: user.id, newRole: pendingRole },
      {
        onSuccess: () => {
          toast.success(`Role changed to ${pendingRole}`)
          setRoleOpen(false)
        },
        onError: (err: { message?: string }) =>
          toast.error(err.message ?? 'Failed to change role'),
      },
    )
  }

  const onDeactivate = () => {
    deactivateUser.mutate(user.id, {
      onSuccess: () => {
        toast.success('User deactivated')
        setDeactivateOpen(false)
      },
      onError: (err: { message?: string }) =>
        toast.error(err.message ?? 'Failed to deactivate user'),
    })
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(ROUTES.users)}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Button>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {initialsFromName(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-2xl">
                  {fullName}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={user.role === ROLES.ADMIN ? 'default' : 'muted'}
                  >
                    {user.role}
                  </Badge>
                  <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {isSelf && <Badge variant="outline">You</Badge>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Edit user</DialogTitle>
                    <DialogDescription>
                      Update {fullName}’s profile and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={form.handleSubmit(onSave)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input
                          id="first_name"
                          {...form.register('first_name')}
                        />
                        {form.formState.errors.first_name && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input
                          id="last_name"
                          {...form.register('last_name')}
                        />
                        {form.formState.errors.last_name && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile_number">Mobile number</Label>
                      <Input
                        id="mobile_number"
                        placeholder="+20 1XX XXX XXXX"
                        {...form.register('mobile_number')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...form.register('address')}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select
                          value={form.watch('gender') ?? ''}
                          onValueChange={(v) =>
                            form.setValue(
                              'gender',
                              v as EditUserInput['gender'],
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={form.watch('role')}
                          onValueChange={(v) =>
                            form.setValue('role', v as EditUserInput['role'])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                            <SelectItem value={ROLES.USER}>User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <Label className="text-sm">Active</Label>
                        <p className="text-xs text-muted-foreground">
                          Inactive users cannot sign in.
                        </p>
                      </div>
                      <Switch
                        checked={form.watch('is_active')}
                        onCheckedChange={(v) => form.setValue('is_active', v)}
                      />
                    </div>

                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateUser.isPending}>
                        {updateUser.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save changes
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Shield className="h-4 w-4" /> Change role
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change role</DialogTitle>
                    <DialogDescription>
                      Admin role grants access to this dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Label>New role</Label>
                    <Select
                      value={pendingRole}
                      onValueChange={(v) =>
                        setPendingRole(v as typeof ROLES.ADMIN)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ROLES.USER}>User</SelectItem>
                        <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setRoleOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onChangeRole}
                      disabled={
                        changeRole.isPending || pendingRole === user.role
                      }
                    >
                      {changeRole.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Update role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Total routes"
          value={user.total_routes ?? 0}
          icon={UsersIcon}
          tone="primary"
        />
        <KPICard
          title="Saved locations"
          value={user.saved_locations_count ?? 0}
          icon={MapPin}
        />
        <KPICard
          title="Favorite routes"
          value={user.favorite_routes_count ?? 0}
          icon={Heart}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Profile details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow
              icon={UserIcon}
              label="First name"
              value={user.first_name}
            />
            <DetailRow
              icon={UserIcon}
              label="Last name"
              value={user.last_name}
            />
            <DetailRow icon={Mail} label="Email" value={user.email} />
            <DetailRow
              icon={Phone}
              label="Mobile"
              value={user.mobile_number || '—'}
            />
            <DetailRow
              icon={Building2}
              label="Gender"
              value={user.gender || '—'}
            />
            <DetailRow
              icon={MapPin}
              label="Address"
              value={user.address || '—'}
              full
            />
            <DetailRow
              icon={Calendar}
              label="Joined"
              value={formatDateTime(user.date_joined)}
            />
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <ShieldAlert className="h-4 w-4" /> Danger zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Deactivating prevents the user from signing in. Their data is
              preserved for analytics. You can’t deactivate yourself.
            </p>
            <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isSelf || !user.is_active}
                >
                  <Power className="h-4 w-4" />
                  {user.is_active ? 'Deactivate user' : 'Already inactive'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Deactivate {fullName}?</DialogTitle>
                  <DialogDescription>
                    The user will not be able to sign in. This can be reversed
                    by editing the user and re-enabling the active flag.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeactivateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onDeactivate}
                    disabled={deactivateUser.isPending}
                  >
                    {deactivateUser.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Deactivate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  full,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
