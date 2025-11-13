'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { RecipeBook, BookMember, BookRole } from '@/lib/types/recipe-books'
import { sendCookbookInvitation } from '@/lib/email/send-cookbook-invitation'
import { invitationLimit, checkRateLimit } from '@/lib/ratelimit'

/**
 * Get all recipe books accessible to the current user
 */
export async function getRecipeBooks() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { books: [], error: 'Not authenticated' }
  }

  // Get books owned by user
  const { data: ownedBooks, error: ownedError } = await supabase
    .from('recipe_books')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  if (ownedError) {
    return { books: [], error: ownedError.message }
  }

  // Get books where user is a member
  const { data: memberBooks, error: memberError } = await supabase
    .from('book_members')
    .select('book_id, role, recipe_books(*)')
    .eq('user_id', user.id)

  if (memberError) {
    return { books: [], error: memberError.message }
  }

  // Combine and deduplicate
  const allBooks = [...(ownedBooks || [])]
  const ownedBookIds = new Set(ownedBooks?.map(b => b.id) || [])

  memberBooks?.forEach(mb => {
    if (mb.recipe_books && !ownedBookIds.has(mb.book_id)) {
      allBooks.push({
        ...mb.recipe_books,
        user_role: mb.role
      })
    }
  })

  // Add counts for each book
  const booksWithCounts = await Promise.all(
    allBooks.map(async (book) => {
      // Count members
      const { count: memberCount } = await supabase
        .from('book_members')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', book.id)

      // Count recipes
      const { count: recipeCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', book.id)

      return {
        ...book,
        member_count: memberCount || 0,
        recipe_count: recipeCount || 0,
        user_role: book.owner_id === user.id ? 'owner' : book.user_role
      }
    })
  )

  return { books: booksWithCounts as RecipeBook[], error: null }
}

/**
 * Get a single recipe book with members
 */
export async function getRecipeBook(bookId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { book: null, error: 'Not authenticated' }
  }

  // Get the book
  const { data: book, error: bookError } = await supabase
    .from('recipe_books')
    .select('*')
    .eq('id', bookId)
    .single()

  if (bookError || !book) {
    return { book: null, error: bookError?.message || 'Book not found' }
  }

  // Get members
  const { data: members, error: membersError } = await supabase
    .from('book_members')
    .select('*')
    .eq('book_id', bookId)

  if (membersError) {
    return { book: null, error: membersError.message }
  }

  // Get emails using admin client
  const adminClient = createAdminClient()
  const { data: { users: allUsers } } = await adminClient.auth.admin.listUsers()

  const userEmailMap = new Map(allUsers?.map(u => [u.id, u.email]) || [])

  // Add emails to members
  const membersWithEmails = members?.map(member => ({
    ...member,
    email: member.user_email || userEmailMap.get(member.user_id) || (member.user_id === user.id ? user.email : 'Unknown')
  }))

  return {
    book: {
      ...book,
      members: membersWithEmails || []
    },
    error: null
  }
}

/**
 * Create a new recipe book
 */
export async function createRecipeBook(data: {
  name: string
  description?: string
  is_shared: boolean
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', bookId: null }
  }

  const { data: book, error } = await supabase
    .from('recipe_books')
    .insert({
      name: data.name,
      description: data.description,
      owner_id: user.id,
      is_shared: data.is_shared,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message, bookId: null }
  }

  revalidatePath('/')
  return { success: true, error: null, bookId: book.id }
}

/**
 * Update a recipe book
 */
export async function updateRecipeBook(
  bookId: string,
  data: {
    name?: string
    description?: string
    is_shared?: boolean
  }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('recipe_books')
    .update(data)
    .eq('id', bookId)
    .eq('owner_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, error: null }
}

/**
 * Delete a recipe book
 */
export async function deleteRecipeBook(bookId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('recipe_books')
    .delete()
    .eq('id', bookId)
    .eq('owner_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, error: null }
}

/**
 * Invite a user to a recipe book by email
 */
export async function inviteToBook(
  bookId: string,
  email: string,
  role: BookRole = 'editor'
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check rate limit (10 invitations per hour)
  const rateLimitResult = await checkRateLimit(invitationLimit, user.id, 'cookbook invitation')
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: rateLimitResult.error || 'Rate limit exceeded. Please try again later.'
    }
  }

  // Verify the current user has permission to invite
  const { data: membership } = await supabase
    .from('book_members')
    .select('role')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'editor'].includes(membership.role)) {
    return { success: false, error: 'No permission to invite members' }
  }

  // Find the user by email using admin client
  const adminClient = createAdminClient()
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers()

  if (usersError) {
    return { success: false, error: 'Unable to search for users' }
  }

  const invitedUser = users?.find(u => u.email === email)

  if (!invitedUser) {
    return { success: false, error: `No user found with email "${email}". They need to sign up first at /signup.` }
  }

  // Get the book details for the email
  const { data: book } = await supabase
    .from('recipe_books')
    .select('name')
    .eq('id', bookId)
    .single()

  if (!book) {
    return { success: false, error: 'Cookbook not found' }
  }

  // Add them as a member
  const { error } = await supabase
    .from('book_members')
    .insert({
      book_id: bookId,
      user_id: invitedUser.id,
      role,
      invited_by: user.id,
    })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'User is already a member of this book' }
    }
    return { success: false, error: error.message }
  }

  // Send invitation email (don't fail if email fails)
  await sendCookbookInvitation({
    toEmail: email,
    inviterName: user.user_metadata?.full_name || user.email || 'Someone',
    cookbookId: bookId,
    cookbookName: book.name,
    role,
  })

  revalidatePath('/')
  return { success: true, error: null }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  memberId: string,
  newRole: BookRole
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the member to find the book
  const { data: member } = await supabase
    .from('book_members')
    .select('book_id')
    .eq('id', memberId)
    .single()

  if (!member) {
    return { success: false, error: 'Member not found' }
  }

  // Verify current user is the owner
  const { data: book } = await supabase
    .from('recipe_books')
    .select('owner_id')
    .eq('id', member.book_id)
    .single()

  if (!book || book.owner_id !== user.id) {
    return { success: false, error: 'Only the owner can change member roles' }
  }

  const { error } = await supabase
    .from('book_members')
    .update({ role: newRole })
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, error: null }
}

/**
 * Remove a member from a book
 */
export async function removeMember(memberId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('book_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, error: null }
}

/**
 * Leave a recipe book
 */
export async function leaveBook(bookId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('book_members')
    .delete()
    .eq('book_id', bookId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, error: null }
}
