'use server'

interface RegisterData {
  username: string
  email: string
  password: string
  user_type: 'community' | 'emergency'
  phone_number?: string
  location?: string
  organization?: string
}

export async function register(formData: FormData) {
  const registerData: RegisterData = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    user_type: formData.get('user_type') as 'community' | 'emergency',
    phone_number: formData.get('phone_number') as string,
    location: formData.get('location') as string,
    organization: formData.get('organization') as string,
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })

    const data = await response.json()

    if (!response.ok) {
      return { 
        error: data.error || 
               Object.values(data).flat().join(', ') || 
               'Registration failed' 
      }
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
    console.error('Registration error:', error)
    return { error: 'Registration failed. Please try again.' }
  }
}

