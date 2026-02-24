import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { FormSchema, FormField, FormFieldValue, FormResponses } from '@/types'

interface DynamicFormRendererProps {
  schema: FormSchema
  initialData?: FormResponses
  onSubmit: (data: FormResponses) => void
  onCancel?: () => void
  isLoading?: boolean
  readOnly?: boolean
}

function shouldShowField(field: FormField, responses: FormResponses): boolean {
  if (!field.conditionalOn) return true
  const { fieldId, value, operator = 'equals' } = field.conditionalOn
  const currentValue = responses[fieldId]

  switch (operator) {
    case 'equals':
      return String(currentValue) === String(value)
    case 'not_equals':
      return String(currentValue) !== String(value)
    case 'contains':
      return String(currentValue).includes(String(value))
    default:
      return true
  }
}

function renderField(
  field: FormField,
  value: FormFieldValue | undefined,
  onChange: (fieldId: string, value: FormFieldValue) => void,
  errors: Record<string, string>,
  readOnly: boolean
) {
  const error = errors[field.id]
  const commonProps = {
    id: field.id,
    disabled: readOnly || field.readOnly,
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <Input
          {...commonProps}
          type={field.type === 'phone' ? 'tel' : field.type}
          label={field.label}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.id, e.target.value)}
          error={error}
          helperText={field.helpText}
        />
      )

    case 'number':
      return (
        <Input
          {...commonProps}
          type="number"
          label={field.label}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.id, Number(e.target.value))}
          error={error}
          helperText={field.helpText}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      )

    case 'date':
      return (
        <Input
          {...commonProps}
          type="date"
          label={field.label}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.id, e.target.value)}
          error={error}
          helperText={field.helpText}
        />
      )

    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          label={field.label}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.id, e.target.value)}
          error={error}
          helperText={field.helpText}
        />
      )

    case 'select':
      return (
        <Select
          {...commonProps}
          label={field.label}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.id, e.target.value)}
          error={error}
          helperText={field.helpText}
        >
          <option value="">Selecione...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      )

    case 'radio':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(field.id, opt.value)}
                  disabled={readOnly}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
          {field.helpText && <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>}
        </div>
      )

    case 'checkbox':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const currentValues = Array.isArray(value) ? value : []
              const isChecked = currentValues.includes(opt.value)
              return (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const newValues = isChecked
                        ? currentValues.filter((v) => v !== opt.value)
                        : [...currentValues, opt.value]
                      onChange(field.id, newValues)
                    }}
                    disabled={readOnly}
                    className="h-4 w-4 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              )
            })}
          </div>
          {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
        </div>
      )

    case 'scale':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
          <div className="flex gap-2">
            {Array.from(
              { length: (field.validation?.max ?? 10) - (field.validation?.min ?? 1) + 1 },
              (_, i) => (field.validation?.min ?? 1) + i
            ).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(field.id, num)}
                disabled={readOnly}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                  value === num
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
          {field.helpText && <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>}
        </div>
      )

    case 'section_header':
      return (
        <div className="pt-4 pb-2 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">{field.label}</h4>
          {field.helpText && <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    default:
      return null
  }
}

function validateField(field: FormField, value: FormFieldValue | undefined): string | null {
  if (field.required && (value === undefined || value === '' || value === null)) {
    return 'Campo obrigatório'
  }

  if (field.type === 'number' && value !== undefined && value !== '') {
    const num = Number(value)
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return `Valor mínimo: ${field.validation.min}`
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return `Valor máximo: ${field.validation.max}`
    }
  }

  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(value))) {
      return 'E-mail inválido'
    }
  }

  if (field.validation?.pattern && value) {
    const regex = new RegExp(field.validation.pattern)
    if (!regex.test(String(value))) {
      return field.validation.patternMessage ?? 'Formato inválido'
    }
  }

  return null
}

export function DynamicFormRenderer({
  schema,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  readOnly = false,
}: DynamicFormRendererProps) {
  const [responses, setResponses] = useState<FormResponses>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (fieldId: string, value: FormFieldValue) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (!shouldShowField(field, responses)) continue
        const error = validateField(field, responses[field.id])
        if (error) {
          newErrors[field.id] = error
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(responses)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {schema.description && (
        <p className="text-gray-600">{schema.description}</p>
      )}

      {schema.sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-4">
          {section.title && (
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields
              .sort((a, b) => a.order - b.order)
              .filter((field) => shouldShowField(field, responses))
              .map((field) => (
                <div
                  key={field.id}
                  className={
                    field.width === 'full' || field.type === 'textarea' || field.type === 'section_header'
                      ? 'col-span-full'
                      : ''
                  }
                >
                  {renderField(field, responses[field.id], handleChange, errors, readOnly)}
                </div>
              ))}
          </div>
        </div>
      ))}

      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" loading={isLoading}>
            Enviar
          </Button>
        </div>
      )}
    </form>
  )
}
