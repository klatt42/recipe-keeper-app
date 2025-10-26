'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadRecipeImage(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', url: null }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'No file provided', url: null }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Use JPG, PNG, WEBP, or GIF', url: null }
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return { success: false, error: 'File too large. Maximum size is 5MB', url: null }
  }

  // Create unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('recipe-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { success: false, error: error.message, url: null }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('recipe-images').getPublicUrl(data.path)

  return { success: true, error: null, url: publicUrl }
}

export async function deleteRecipeImage(imageUrl: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Extract path from URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/recipe-images/[path]
  const urlParts = imageUrl.split('/recipe-images/')
  if (urlParts.length !== 2) {
    return { success: false, error: 'Invalid image URL' }
  }

  const filePath = urlParts[1]

  // Only allow deletion of own images
  if (!filePath.startsWith(user.id)) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.storage.from('recipe-images').remove([filePath])

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
