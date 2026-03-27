import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  cookieStore.getAll().forEach((cookie) => {
    cookieStore.delete(cookie.name) 
  })

  return new Response(null, { status: 200 })  
}
