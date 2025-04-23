import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  
  // 1. Verify credentials
  const user = await authenticateUser(email, password)
  
  // 2. Set cookie
  cookies().set({
    name: 'session',
    value: user.sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  return Response.json({ user })
}