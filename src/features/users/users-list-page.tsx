import { Search, X, Users as UsersIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useUsers } from './hooks'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/shared/pagination'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { useDebounce } from '@/hooks/use-debounce'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useSetLayoutTitle } from '@/lib/layout-context'
import { ROLES } from '@/constants/enums'
import { ROUTES } from '@/constants/routes'
import { formatDate, initialsFromName } from '@/lib/format'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All users' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.USER, label: 'User' },
]

export default function UsersListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const debouncedSearch = useDebounce(searchInput, 300)

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      is_active:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? true
            : false,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [debouncedSearch, roleFilter, statusFilter, pageSize, page],
  )

  const { data, isLoading, isError, error, refetch } =
    useUsers(queryParams)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter, statusFilter])

  useDocumentTitle('Users')
  useSetLayoutTitle('Users')

  const users = data ?? []
  const hasActiveFilters =
    Boolean(searchInput) || roleFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search, filter, and manage every account on the platform."
      />

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="pl-9 pr-9"
              aria-label="Search users"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              message={(error as Error).message ?? 'Failed to load users'}
              onRetry={() => refetch()}
            />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description={
              hasActiveFilters
                ? 'Try adjusting your filters or clearing the search.'
                : 'No users have signed up yet.'
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(ROUTES.userDetail(user.id))}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {initialsFromName(
                                user.first_name,
                                user.last_name,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={
                            user.role === ROLES.ADMIN ? 'default' : 'muted'
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={user.is_active ? 'success' : 'destructive'}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {formatDate(user.date_joined)}
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-muted-foreground">
                        ID #{user.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => navigate(ROUTES.userDetail(user.id))}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initialsFromName(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge
                        variant={
                          user.role === ROLES.ADMIN ? 'default' : 'muted'
                        }
                      >
                        {user.role}
                      </Badge>
                      <Badge
                        variant={user.is_active ? 'success' : 'destructive'}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-border">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={users.length}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
