'use server'

export async function simpleTest() {
  console.log('[simpleTest] This function was called!')
  return { success: true, data: 'It works!' }
}
