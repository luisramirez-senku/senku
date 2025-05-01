'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

// ✅ Definimos el tipo esperado de la respuesta
type VerifyResponse = {
  token: string
}

export default function VerifyPage() {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const rawPhone = searchParams.get('phone') || ''
  const phone = decodeURIComponent(rawPhone)

  useEffect(() => {
    if (!phone || !phone.startsWith('+')) {
      router.push('/')
    }
  }, [phone, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post<VerifyResponse>('http://localhost:4000/auth/verify', {
        phone,
        otp
      })

      const token = response.data.token
      console.log('✅ Token recibido del backend:', token)

      localStorage.setItem('token', token)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('❌ Error al verificar OTP:', err)
      setError('OTP inválido. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Verificación OTP</h1>
        <p className="text-sm text-center mb-2 text-black">
          Hemos enviado un código a {phone}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Código OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>

          {error && <p className="text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </main>
  )
}
