'use client'

import { useState } from 'react'
import { inviteToBook, removeMember, updateMemberRole, leaveBook } from '@/lib/actions/recipe-books'
import { moveRecipesToCookbook } from '@/lib/actions/recipes'
import type { BookWithMembers, BookRole } from '@/lib/types/recipe-books'

interface ManageCookbookModalProps {
  isOpen: boolean
  onClose: () => void
  book: BookWithMembers | null
  currentUserId: string
}

export function ManageCookbookModal({
  isOpen,
  onClose,
  book,
  currentUserId,
}: ManageCookbookModalProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<BookRole>('editor')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen || !book) return null

  const isOwner = book.owner_id === currentUserId
  const currentMember = book.members?.find((m) => m.user_id === currentUserId)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    setError(null)
    setSuccess(null)

    const result = await inviteToBook(book.id, inviteEmail, inviteRole)

    if (result.success) {
      setSuccess(`Invitation sent to ${inviteEmail}!`)
      setInviteEmail('')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setError(result.error || 'Failed to send invitation')
    }

    setIsInviting(false)
  }

  const handleRemoveMember = async (memberId: string, memberEmail?: string) => {
    if (!confirm(`Remove ${memberEmail || 'this member'} from the cookbook?`)) return

    const result = await removeMember(memberId)
    if (result.success) {
      window.location.reload()
    } else {
      setError(result.error || 'Failed to remove member')
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this cookbook?')) return

    const result = await leaveBook(book.id)
    if (result.success) {
      onClose()
      window.location.reload()
    } else {
      setError(result.error || 'Failed to leave cookbook')
    }
  }

  const handleChangeRole = async (memberId: string, newRole: BookRole) => {
    const result = await updateMemberRole(memberId, newRole)
    if (result.success) {
      window.location.reload()
    } else {
      setError(result.error || 'Failed to update role')
    }
  }

  const handleImportRecipes = async () => {
    if (!confirm('Import all unassigned recipes to this cookbook?')) return

    setError(null)
    setSuccess(null)
    const result = await moveRecipesToCookbook(book.id)

    if (result.success) {
      setSuccess(`Successfully imported ${result.count} recipe${result.count !== 1 ? 's' : ''}!`)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setError(result.error || 'Failed to import recipes')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="min-h-full flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className={`border-b border-gray-200 px-6 py-5 rounded-t-2xl ${
            book.is_shared
              ? 'bg-gradient-to-r from-rose-50 to-pink-50'
              : 'bg-gradient-to-r from-amber-50 to-orange-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-md text-white ${
                  book.is_shared
                    ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                }`}>
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{book.name}</h2>
                  <p className="text-sm text-gray-600">
                    {book.is_shared ? '❤️ Family Cookbook' : 'Personal Cookbook'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Invite Form - Only for shared books and owners/editors */}
            {book.is_shared && currentMember && ['owner', 'editor'].includes(currentMember.role) && (
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white flex-shrink-0">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Invite Family Members</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Share this cookbook with your family so everyone can contribute their favorite recipes!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleInvite} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="family@example.com"
                      required
                      className="sm:col-span-2 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as BookRole)}
                      className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 font-semibold text-white shadow-md hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
                  >
                    {isInviting ? 'Sending Invitation...' : 'Send Invitation'}
                  </button>
                </form>
              </div>
            )}

            {/* Import Recipes Button - Only for owners */}
            {isOwner && (
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex-shrink-0">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Import Unassigned Recipes</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Move all recipes that aren't in any cookbook to this one.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleImportRecipes}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Import All Unassigned Recipes
                </button>
              </div>
            )}

            {/* Members List */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cookbook Members ({book.members?.length || 0})
              </h3>

              <div className="space-y-2">
                {book.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {member.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.email}
                          {member.user_id === currentUserId && (
                            <span className="ml-2 text-sm text-gray-500">(You)</span>
                          )}
                          {member.user_id === book.owner_id && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Owner
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{member.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Role Selector - Only owner can change roles */}
                      {isOwner && member.user_id !== currentUserId && (
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value as BookRole)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}

                      {/* Remove Button - Owner can remove others, users can leave */}
                      {(isOwner && member.user_id !== currentUserId) || (!isOwner && member.user_id === currentUserId) && (
                        <button
                          onClick={() =>
                            member.user_id === currentUserId
                              ? handleLeave()
                              : handleRemoveMember(member.id, member.email)
                          }
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                          title={member.user_id === currentUserId ? 'Leave cookbook' : 'Remove member'}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Cookbook Button (for non-owners) */}
            {!isOwner && (
              <button
                onClick={handleLeave}
                className="w-full rounded-lg border-2 border-red-300 px-4 py-3 font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                Leave This Cookbook
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
