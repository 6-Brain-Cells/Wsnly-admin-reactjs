import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  Edit,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User as UserIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from './hooks'
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordInput,
  type ProfileInput,
} from './schemas'
import { useAuthStore } from './store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useSetLayoutTitle } from '@/lib/layout-context'
import { GENDERS, ROLES } from '@/constants/enums'
import { formatDateTime, initialsFromName } from '@/lib/format'

export default function ProfilePage() {
  const setUser = useAuthStore((s) => s.setUser)
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          mobile_number: profile.mobile_number ?? '',
          address: profile.address ?? '',
          gender: (profile.gender as ProfileInput['gender']) ?? undefined,
        }
      : undefined,
  })

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  useDocumentTitle('Profile')
  useSetLayoutTitle('Profile')

  useEffect(() => {
    if (profile) setUser(profile)
  }, [profile, setUser])

  const onSaveProfile = (values: ProfileInput) => {
    updateProfile.mutate(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        mobile_number: values.mobile_number || undefined,
        address: values.address || undefined,
        gender: values.gender,
      },
      {
        onSuccess: () => {
          toast.success('Profile updated')
          setEditOpen(false)
        },
        onError: (err: { message?: string }) =>
          toast.error(err.message ?? 'Failed to update profile'),
      },
    )
  }

  const onChangePassword = (values: ChangePasswordInput) => {
    changePassword.mutate(
      {
        current_password: values.current_password,
        new_password: values.new_password,
      },
      {
        onSuccess: () => {
          toast.success('Password changed')
          passwordForm.reset()
          setPasswordOpen(false)
        },
        onError: (err: { message?: string }) =>
          toast.error(err.message ?? 'Failed to change password'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your admin account information and security."
      />

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {initialsFromName(profile.first_name, profile.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={profile.role === ROLES.ADMIN ? 'default' : 'muted'}
                  >
                    {profile.role}
                  </Badge>
                  <Badge variant={profile.is_active ? 'success' : 'destructive'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {profile.is_staff && <Badge variant="outline">Staff</Badge>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4" /> Edit profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Update your personal information.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={profileForm.handleSubmit(onSaveProfile)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input
                          id="first_name"
                          {...profileForm.register('first_name')}
                        />
                        {profileForm.formState.errors.first_name && (
                          <p className="text-xs text-destructive">
                            {profileForm.formState.errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input
                          id="last_name"
                          {...profileForm.register('last_name')}
                        />
                        {profileForm.formState.errors.last_name && (
                          <p className="text-xs text-destructive">
                            {profileForm.formState.errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile_number">Mobile number</Label>
                      <Input
                        id="mobile_number"
                        placeholder="+20 1XX XXX XXXX"
                        {...profileForm.register('mobile_number')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...profileForm.register('address')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={profileForm.watch('gender') ?? ''}
                        onValueChange={(v) =>
                          profileForm.setValue(
                            'gender',
                            v as ProfileInput['gender'],
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
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
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

              <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Lock className="h-4 w-4" /> Change password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new strong password.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={passwordForm.handleSubmit(onChangePassword)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current password</Label>
                      <Input
                        id="current_password"
                        type="password"
                        {...passwordForm.register('current_password')}
                      />
                      {passwordForm.formState.errors.current_password && (
                        <p className="text-xs text-destructive">
                          {
                            passwordForm.formState.errors.current_password
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        {...passwordForm.register('new_password')}
                      />
                      {passwordForm.formState.errors.new_password && (
                        <p className="text-xs text-destructive">
                          {passwordForm.formState.errors.new_password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        {...passwordForm.register('confirm_password')}
                      />
                      {passwordForm.formState.errors.confirm_password && (
                        <p className="text-xs text-destructive">
                          {
                            passwordForm.formState.errors.confirm_password
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPasswordOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={changePassword.isPending}
                      >
                        {changePassword.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                        Update password
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row icon={UserIcon} label="First name" value={profile.first_name} />
          <Row icon={UserIcon} label="Last name" value={profile.last_name} />
          <Row icon={Mail} label="Email" value={profile.email} />
          <Row
            icon={Phone}
            label="Mobile"
            value={profile.mobile_number || '—'}
          />
          <Row
            icon={Building2}
            label="Gender"
            value={profile.gender || '—'}
          />
          <Row icon={MapPin} label="Address" value={profile.address || '—'} />
          <Row
            icon={Shield}
            label="Role"
            value={profile.role}
          />
          <Row
            icon={UserIcon}
            label="Joined"
            value={formatDateTime(profile.date_joined)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
