'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function LoginPage() {
  const [localNumber, setLocalNumber] = useState('')
  const [countryCode, setCountryCode] = useState('+506')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const countryCodes = [
    { code: '+506', label: 'Costa Rica' },
    { code: '+1', label: 'Estados Unidos' },
    { code: '+52', label: 'México' },
    { code: '+34', label: 'España' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fullPhone = `${countryCode}${localNumber}`.replace(/\s+/g, '').trim()

    try {
      const response = await axios.post('http://localhost:4000/auth/init', {
        phone: fullPhone
      })

      if (response.status === 200) {
        router.push(`/verify?phone=${encodeURIComponent(fullPhone)}`)
      }
    } catch (err: any) {
      console.error('❌ Error completo:', err)
    
      if (err?.response?.status === 404) {
        setError('Cliente no registrado. Contacte al comercio.')
      } else if (err?.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err?.message === 'Network Error') {
        setError('No se pudo conectar al servidor. Verificá que el backend esté corriendo.')
      } else {
        setError('Error inesperado. Revisá la consola para más detalles.')
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-black">Bienvenido</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 font-medium block mb-1">
              Número de teléfono
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </select>

              <input
                type="tel"
                placeholder="8888 8888"
                value={localNumber}
                onChange={(e) =>
                  setLocalNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Enviando OTP...' : 'Continuar'}
          </button>

          {error && <p className="text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </main>
  )
}
