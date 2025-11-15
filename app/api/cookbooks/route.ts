import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('[API /api/cookbooks] Request received')

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('[API /api/cookbooks] Not authenticated')
      return NextResponse.json({ books: [], error: 'Not authenticated' }, { status: 401 })
    }

    console.log('[API /api/cookbooks] User authenticated:', user.id)

    // Get books owned by user
    const { data: ownedBooks, error: ownedError } = await supabase
      .from('recipe_books')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })

    console.log('[API /api/cookbooks] Owned books:', ownedBooks?.length || 0)

    if (ownedError) {
      console.error('[API /api/cookbooks] Error fetching owned books:', ownedError)
      return NextResponse.json({ books: [], error: ownedError.message }, { status: 500 })
    }

    // Get book IDs where user is a member
    const { data: membershipData, error: memberError } = await supabase
      .from('book_members')
      .select('book_id, role')
      .eq('user_id', user.id)

    console.log('[API /api/cookbooks] Memberships:', membershipData?.length || 0)

    if (memberError) {
      console.error('[API /api/cookbooks] Error fetching memberships:', memberError)
      return NextResponse.json({ books: [], error: memberError.message }, { status: 500 })
    }

    // Get the actual books for memberships
    const memberBookIds = membershipData?.map(m => m.book_id).filter(id => !ownedBooks?.some(b => b.id === id)) || []
    const membershipRoles = new Map(membershipData?.map(m => [m.book_id, m.role]) || [])

    let memberBooks: any[] = []
    if (memberBookIds.length > 0) {
      const { data: memberBooksData } = await supabase
        .from('recipe_books')
        .select('*')
        .in('id', memberBookIds)

      memberBooks = memberBooksData || []
    }

    console.log('[API /api/cookbooks] Member books:', memberBooks.length)

    // Combine books
    const allBooks = [
      ...(ownedBooks || []),
      ...memberBooks.map(book => ({
        ...book,
        user_role: membershipRoles.get(book.id) || 'viewer'
      }))
    ]

    if (allBooks.length === 0) {
      console.log('[API /api/cookbooks] No books found')
      return NextResponse.json({ books: [], error: null })
    }

    // Add counts for each book
    const booksWithCounts = await Promise.all(
      allBooks.map(async (book) => {
        const { count: memberCount } = await supabase
          .from('book_members')
          .select('*', { count: 'exact', head: true })
          .eq('book_id', book.id)

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

    console.log('[API /api/cookbooks] Returning', booksWithCounts.length, 'books')

    // Serialize to plain objects
    const plainBooks = booksWithCounts.map(book => ({
      id: book.id,
      name: book.name,
      description: book.description || null,
      owner_id: book.owner_id,
      is_shared: Boolean(book.is_shared),
      created_at: typeof book.created_at === 'string' ? book.created_at : new Date(book.created_at).toISOString(),
      updated_at: typeof book.updated_at === 'string' ? book.updated_at : new Date(book.updated_at).toISOString(),
      member_count: Number(book.member_count) || 0,
      recipe_count: Number(book.recipe_count) || 0,
      user_role: book.user_role || 'viewer'
    }))

    return NextResponse.json({ books: plainBooks, error: null })
  } catch (error) {
    console.error('[API /api/cookbooks] Unexpected error:', error)
    return NextResponse.json(
      { books: [], error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
