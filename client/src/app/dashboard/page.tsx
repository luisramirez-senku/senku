'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

// Tipos
type Customer = {
  id: string
  phone: string
  name?: string
  idNumber?: string
  verified: boolean
  createdAt: string
}

type LoyaltyProgram = {
  programId: string
  name: string
  type: string // "points" | "cashback" | "stamps"
  pointsBalance: number
  cashbackBalance: number
  stampsBalance: number
  walletPassId?: string
  walletPlatform?: string
}

type ProgramResponse = {
  programs: LoyaltyProgram[]
}

export default function DashboardPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const [meRes, programsRes] = await Promise.all([
          axios.get<Customer>('http://localhost:4000/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get<ProgramResponse>('http://localhost:4000/auth/me/programs', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        setCustomer(meRes.data)
        setPrograms(programsRes.data.programs)

        // ✅ Verificación visual de la data recibida
        console.log('📦 Programas recibidos:', programsRes.data.programs)
      } catch (err: any) {
        console.error('❌ Error en dashboard:', err)
        setError('No se pudo cargar la información. Intenta más tarde.')
      }
    }

    fetchData()
  }, [router])

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (!customer) {
    return <div className="p-6 text-gray-700">Cargando información del cliente...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">¡Hola, {customer.name || customer.phone}!</h1>
        <p className="text-sm text-gray-600 mb-4">
          Cédula / DIMEX: {customer.idNumber || 'No registrada'}
        </p>

        <h2 className="text-lg font-semibold mb-3">Tus programas de lealtad:</h2>

        {programs.length === 0 ? (
          <p className="text-gray-600">No estás inscrito en ningún programa aún.</p>
        ) : (
          <ul className="space-y-3">
<ul>
            {programs.map((p) => {
                console.log('📊 Render programa:', p)

                return (
                <li key={p.programId} className="p-4 border rounded-lg bg-gray-50">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-600">Tipo: {p.type}</p>

                    {p.type === 'POINTS' && (
                    <p className="text-sm text-blue-700">
                        Puntos acumulados: {p.pointsBalance}
                    </p>
                    )}

                    {p.type === 'CASHBACK' && (
                    <p className="text-sm text-green-700">
                        Cashback disponible: ₡{p.cashbackBalance}
                    </p>
                    )}

                    {p.type === 'STAMPS' && (
                    <p className="text-sm text-purple-700">
                        Sellos acumulados: {p.stampsBalance}
                    </p>
                    )}
                </li>
                )
            })}
            </ul>
          </ul>
        )}
      </div>
    </main>
  )
}
