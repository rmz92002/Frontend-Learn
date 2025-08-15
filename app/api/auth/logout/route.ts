import { cookies } from 'next/headers'

export async function POST() {
  cookies().delete('access_token')
  return Response.json({ success: true })
}
