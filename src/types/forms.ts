// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Form System Types
// Type definitions for the configurable form builder and renderer.
// Professionals can create custom form templates (anamnesis, intake forms,
// follow-up questionnaires, etc.) that patients fill out.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Field Types ─────────────────────────────────────────────────────────────

/**
 * Supported field types for the dynamic form builder.
 *
 * - `text` — Single-line text input.
 * - `textarea` — Multi-line text input.
 * - `number` — Numeric input with optional min/max validation.
 * - `email` — Email address input with format validation.
 * - `phone` — Phone number input (Brazilian format).
 * - `date` — Date picker (YYYY-MM-DD).
 * - `select` — Single-choice dropdown.
 * - `multiselect` — Multiple-choice selection (checkboxes or multi-select).
 * - `checkbox` — Single boolean checkbox or a group of checkboxes.
 * - `radio` — Single-choice radio button group.
 * - `file` — File upload field.
 * - `section_header` — Non-input visual divider with a title (for form layout).
 * - `scale` — Numeric scale (e.g., 1-10 pain scale).
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'section_header'
  | 'scale'

// ─── Field Option ────────────────────────────────────────────────────────────

/**
 * A selectable option for fields that present a list of choices
 * (select, multiselect, radio, checkbox groups).
 */
export interface FieldOption {
  /** Display label shown to the user. */
  label: string
  /** Machine-readable value stored in the submission. */
  value: string
}

// ─── Validation Rules ────────────────────────────────────────────────────────

/**
 * Validation constraints applied to a form field.
 * Which properties are relevant depends on the field type.
 */
export interface FieldValidation {
  /**
   * Minimum value for `number` and `scale` fields.
   * Minimum length for `text` and `textarea` fields.
   */
  min?: number
  /**
   * Maximum value for `number` and `scale` fields.
   * Maximum length for `text` and `textarea` fields.
   */
  max?: number
  /**
   * Regular expression pattern the value must match.
   * Applied to `text`, `textarea`, `email`, and `phone` fields.
   */
  pattern?: string
  /**
   * Human-readable error message shown when the pattern validation fails.
   */
  patternMessage?: string
  /**
   * Maximum file size in bytes. Only applicable to `file` fields.
   */
  maxFileSize?: number
  /**
   * Accepted MIME types. Only applicable to `file` fields.
   * Example: `["image/jpeg", "image/png", "application/pdf"]`
   */
  acceptedFileTypes?: string[]
  /**
   * Step increment for `number` and `scale` fields.
   * Example: `0.5` allows values like 1.0, 1.5, 2.0.
   */
  step?: number
}

// ─── Conditional Display ─────────────────────────────────────────────────────

/**
 * Condition that controls whether a field is visible.
 * When specified, the field is only shown if the referenced field
 * has the specified value. Supports simple equality checks.
 */
export interface FieldCondition {
  /** The `id` of the field whose value determines visibility. */
  fieldId: string
  /**
   * The value the referenced field must have for this field to be shown.
   * For checkbox fields, use `"true"` or `"false"`.
   */
  value: string
  /**
   * Comparison operator. Defaults to `"equals"` if not specified.
   */
  operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
}

// ─── Form Field ──────────────────────────────────────────────────────────────

/**
 * Definition of a single field within a form template.
 * Fields are rendered in order within their section.
 */
export interface FormField {
  /**
   * Unique identifier for this field within the form.
   * Used as the key in submission responses.
   */
  id: string
  /** The input type that determines how the field is rendered. */
  type: FieldType
  /** Display label shown above the field. */
  label: string
  /** Placeholder text shown inside the input when empty. */
  placeholder?: string
  /** Whether the field must be filled before submission. */
  required: boolean
  /**
   * Help text displayed below the field to guide the user.
   */
  helpText?: string
  /**
   * Available options for choice-based fields
   * (`select`, `multiselect`, `radio`, `checkbox` groups).
   */
  options?: FieldOption[]
  /** Validation rules applied to the field value. */
  validation?: FieldValidation
  /**
   * Conditional display rule. When set, the field is only visible
   * if the condition is met.
   */
  conditionalOn?: FieldCondition
  /**
   * Display order within the section (0-indexed).
   * Fields are rendered in ascending order.
   */
  order: number
  /**
   * Default value to pre-populate the field with.
   * Type depends on the field type (string for text, number for scale, etc.).
   */
  defaultValue?: string | number | boolean | string[]
  /**
   * Whether this field should be rendered as read-only
   * (value is visible but not editable).
   */
  readOnly?: boolean
  /**
   * Width hint for layout purposes.
   * - `full` — spans the entire row (default).
   * - `half` — takes up half the row width.
   * - `third` — takes up one-third of the row width.
   */
  width?: 'full' | 'half' | 'third'
}

// ─── Form Section ────────────────────────────────────────────────────────────

/**
 * A logical grouping of fields within a form.
 * Sections provide visual separation and can be used to organize
 * related questions (e.g., "Personal Information", "Medical History").
 */
export interface FormSection {
  /** Display title for the section. */
  title: string
  /** Optional description shown below the section title. */
  description?: string
  /** Ordered list of fields in this section. */
  fields: FormField[]
}

// ─── Form Schema ─────────────────────────────────────────────────────────────

/**
 * Complete schema defining the structure of a dynamic form.
 * Stored as JSON in the `form_templates.schema` column.
 */
export interface FormSchema {
  /** Display title of the form (shown at the top). */
  title: string
  /** Optional description or instructions shown before the form fields. */
  description?: string
  /** Ordered list of sections that compose the form. */
  sections: FormSection[]
  /**
   * Schema version number for forward compatibility.
   * Increment when making breaking changes to the schema format.
   */
  version?: number
}

// ─── Submission Types ────────────────────────────────────────────────────────

/**
 * The value of a single field in a form submission.
 * The actual type depends on the field type:
 * - `text`, `textarea`, `email`, `phone`, `date`, `select`, `radio` -> `string`
 * - `number`, `scale` -> `number`
 * - `checkbox` (single) -> `boolean`
 * - `multiselect`, `checkbox` (group) -> `string[]`
 * - `file` -> `string` (storage URL)
 * - `section_header` -> never submitted
 */
export type FormFieldValue = string | number | boolean | string[] | null

/**
 * A map of field IDs to their submitted values.
 * This is the shape stored in `form_submissions.responses`.
 */
export type FormResponses = Record<string, FormFieldValue>

// ─── Form Builder State Types ────────────────────────────────────────────────

/**
 * State of a form field currently being edited in the form builder.
 * Extends FormField with builder-specific metadata.
 */
export interface FormFieldDraft extends FormField {
  /** Whether this field is currently selected in the builder UI. */
  isSelected?: boolean
  /** Whether this field has unsaved changes. */
  isDirty?: boolean
}

/**
 * State of a form section in the builder.
 */
export interface FormSectionDraft extends Omit<FormSection, 'fields'> {
  /** Fields with builder state attached. */
  fields: FormFieldDraft[]
  /** Whether this section is collapsed in the builder UI. */
  isCollapsed?: boolean
}

/**
 * Complete form builder state, including the schema being edited
 * and UI metadata.
 */
export interface FormBuilderState {
  /** The form schema being edited. */
  schema: {
    title: string
    description?: string
    sections: FormSectionDraft[]
    version?: number
  }
  /** ID of the currently selected field, if any. */
  selectedFieldId: string | null
  /** Index of the currently active section in the builder. */
  activeSectionIndex: number
  /** Whether the form has unsaved changes. */
  isDirty: boolean
}

// ─── Form Rendering / Runtime Types ──────────────────────────────────────────

/**
 * Validation error for a specific field.
 */
export interface FormFieldError {
  /** The field ID that has the error. */
  fieldId: string
  /** Human-readable error message. */
  message: string
}

/**
 * Result of validating an entire form submission.
 */
export interface FormValidationResult {
  /** Whether the entire form passed validation. */
  isValid: boolean
  /** List of field-level validation errors. */
  errors: FormFieldError[]
}

/**
 * Callback signatures used by the form renderer component.
 */
export interface FormRendererCallbacks {
  /** Called when a field value changes. */
  onFieldChange: (fieldId: string, value: FormFieldValue) => void
  /** Called when the form is submitted. */
  onSubmit: (responses: FormResponses) => void | Promise<void>
  /** Called when the form submission is cancelled. */
  onCancel?: () => void
  /** Called when a file is uploaded (for file fields). Returns the storage URL. */
  onFileUpload?: (fieldId: string, file: File) => Promise<string>
}
