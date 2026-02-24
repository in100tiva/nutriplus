import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, MapPin, Calendar, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { toastSuccess, toastError } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BRAZILIAN_STATES } from '@/lib/constants'

export function PatientOnboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    try {
      // Update profile with patient-specific info via metadata
      const { error } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Store patient-specific data (phone, dob, location)
      // In a real implementation, you'd have a patient_profiles table
      // For now, we store in user metadata
      await supabase.auth.updateUser({
        data: {
          phone,
          date_of_birth: dateOfBirth,
          city,
          state,
          onboarding_completed: true,
        },
      })

      toastSuccess('Cadastro concluído!', 'Bem-vindo ao MedHub')
      navigate('/app', { replace: true })
    } catch (err) {
      console.error('Erro ao salvar dados do paciente:', err)
      toastError('Erro ao salvar', 'Tente novamente mais tarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-xl items-center gap-3 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white">
            M
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            MedHub
          </span>
          <span className="ml-2 text-sm text-gray-500">Complete seu cadastro</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Concluir cadastro</CardTitle>
            <CardDescription>
              Precisamos de algumas informações para personalizar sua experiência
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                leftIcon={<Phone className="h-4 w-4" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Para contato com os profissionais"
              />

              <Input
                label="Data de nascimento"
                type="date"
                leftIcon={<Calendar className="h-4 w-4" />}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Cidade"
                  placeholder="Sua cidade"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <Select
                  label="Estado"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Selecione"
                >
                  {BRAZILIAN_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>

              <Button type="submit" loading={saving} className="mt-2 w-full">
                <Check className="h-4 w-4" />
                Concluir cadastro
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
