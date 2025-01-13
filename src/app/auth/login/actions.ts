'use server'

export async function login(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Login failed' }
    }

    return { 
      success: true,
      user: data.user,
      tokens: {
        access: data.access,
        refresh: data.refresh
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Login failed. Please try again.' }
  }
}

