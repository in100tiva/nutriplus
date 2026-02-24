// ─────────────────────────────────────────────────────────────────────────────
// Type Index — Re-exports & Utility Types
// Central barrel file for all application types. Import from '@/types' or
// '../types' to access any type without knowing which sub-module it lives in.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Re-exports: Database Types ──────────────────────────────────────────────

export type {
  // Enum types
  UserRole,
  VerificationStatus,
  AppointmentStatus,
  AppointmentType,
  AppointmentModality,
  PaymentStatus,
  RecordType,
  TaskType,
  TaskRecurrence,
  TaskStatus,
  TaskPriority,
  DocumentCategory,
  PlanType,
  SubscriptionStatus,
  NotificationType,
  OrgMemberRole,
  RegistrationType,

  // Shared / embedded types
  Address,
  TimeSlot,
  DaySchedule,
  WeeklySchedule,

  // Core entity interfaces
  Profile,
  Specialty,
  ProfessionalProfile,
  Organization,
  OrganizationMember,
  ScheduleConfig,
  ScheduleBlock,
  Appointment,
  ClinicalRecord,
  FormTemplate,
  FormSubmission,
  Task,
  TaskCompletion,
  Conversation,
  Message,
  Review,
  Document,
  Subscription,
  Notification,

  // Relationship / joined types
  AppointmentWithPatient,
  AppointmentWithProfessional,
  AppointmentWithParticipants,
  AppointmentDetail,
  ProfessionalWithProfile,
  ProfessionalWithSpecialty,
  ProfessionalListing,
  ReviewWithPatient,
  ReviewWithParticipants,
  ClinicalRecordWithProfessional,
  ClinicalRecordWithParticipants,
  MessageWithSender,
  ConversationWithParticipants,
  TaskWithParticipants,
  TaskWithCompletions,
  DocumentWithUploader,
  FormSubmissionWithDetails,
  OrganizationWithMembers,
  OrganizationMemberWithDetails,
  NotificationWithDetails,
  SubscriptionWithUser,

  // Insert / update types
  ProfileInsert,
  ProfileUpdate,
  ProfessionalProfileInsert,
  ProfessionalProfileUpdate,
  AppointmentInsert,
  AppointmentUpdate,
  ClinicalRecordInsert,
  ClinicalRecordUpdate,
  TaskInsert,
  TaskUpdate,
  MessageInsert,
  ReviewInsert,
  DocumentInsert,
  OrganizationInsert,
  OrganizationUpdate,
  NotificationInsert,
} from './database'

// ─── Re-exports: Form Types ─────────────────────────────────────────────────

export type {
  FieldType,
  FieldOption,
  FieldValidation,
  FieldCondition,
  FormField,
  FormSection,
  FormSchema,
  FormFieldValue,
  FormResponses,
  FormFieldDraft,
  FormSectionDraft,
  FormBuilderState,
  FormFieldError,
  FormValidationResult,
  FormRendererCallbacks,
} from './forms'

// ─── Utility Types ───────────────────────────────────────────────────────────

/**
 * Adds a required `id` field to any type.
 * Useful for ensuring an entity has been persisted (i.e., has a server-assigned ID).
 *
 * @example
 * type SavedTask = WithId<TaskInsert>
 * // { id: string; professional_id: string; patient_id: string; ... }
 */
export type WithId<T> = T & { id: string }

/**
 * Adds required timestamp fields to any type.
 * Useful for representing entities after they have been persisted.
 *
 * @example
 * type PersistedRecord = WithTimestamps<ClinicalRecordInsert>
 */
export type WithTimestamps<T> = T & {
  created_at: string
  updated_at: string
}

/**
 * Pagination metadata returned alongside paginated query results.
 */
export interface Pagination {
  /** Current page number (1-indexed). */
  page: number
  /** Number of items per page. */
  perPage: number
  /** Total number of items across all pages. */
  total: number
}

/**
 * Sort direction for ordered queries.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Configuration for sorting a list query.
 *
 * @template T - The entity type being sorted. Field must be a key of T.
 *
 * @example
 * const sort: SortConfig<Appointment> = { field: 'date', direction: 'desc' }
 */
export interface SortConfig<T> {
  /** The field to sort by. */
  field: keyof T & string
  /** Sort direction. */
  direction: SortDirection
}

/**
 * Standard API response wrapper.
 * Uses a discriminated union so that `data` is non-null only on success,
 * and `error` is non-null only on failure.
 *
 * @template T - The type of the successful response data.
 *
 * @example
 * const result: ApiResponse<Profile> = { data: profile, error: null }
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.full_name)
 * }
 */
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string }

/**
 * Paginated API response that includes both the data array and pagination info.
 *
 * @template T - The type of each item in the results array.
 *
 * @example
 * const response: PaginatedResponse<Appointment> = {
 *   data: appointments,
 *   pagination: { page: 1, perPage: 20, total: 57 },
 *   error: null,
 * }
 */
export type PaginatedResponse<T> =
  | { data: T[]; pagination: Pagination; error: null }
  | { data: null; pagination: null; error: string }

/**
 * Query filter parameters commonly used for list endpoints.
 *
 * @template T - The entity type being queried.
 */
export interface ListQueryParams<T = Record<string, unknown>> {
  /** Page number to retrieve (1-indexed). */
  page?: number
  /** Number of items per page. */
  perPage?: number
  /** Field to sort by and direction. */
  sort?: SortConfig<T>
  /** Free-text search query. */
  search?: string
  /** Key-value filters to apply. */
  filters?: Partial<T>
}

/**
 * Makes specified keys of T required while keeping the rest unchanged.
 *
 * @example
 * type RequiredAppointment = RequireKeys<Appointment, 'price_cents' | 'notes'>
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Makes all properties of T optional except for the specified keys.
 *
 * @example
 * type PartialExceptId = OptionalExcept<Profile, 'id'>
 * // { id: string; full_name?: string; email?: string; ... }
 */
export type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

/**
 * Extracts only the keys of T whose values are assignable to V.
 *
 * @example
 * type StringKeys = KeysOfType<Profile, string>
 * // 'id' | 'full_name' | 'email' | 'role' | 'created_at' | 'updated_at'
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * Makes the type deeply partial — all nested object properties become optional.
 *
 * @example
 * type DeepPartialConfig = DeepPartial<ScheduleConfig>
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/**
 * Represents a date range with start and end boundaries.
 * Used for filtering appointments, schedule blocks, reports, etc.
 */
export interface DateRange {
  /** Start date in ISO 8601 format (YYYY-MM-DD or full timestamp). */
  startDate: string
  /** End date in ISO 8601 format (YYYY-MM-DD or full timestamp). */
  endDate: string
}

/**
 * A simple key-value pair used for select options, filter chips, etc.
 */
export interface SelectOption<V = string> {
  /** Display label. */
  label: string
  /** Machine-readable value. */
  value: V
}

/**
 * Async operation state for tracking loading, error, and data in hooks/stores.
 *
 * @template T - The type of the data being loaded.
 *
 * @example
 * const [state, setState] = useState<AsyncState<Profile[]>>({
 *   data: null,
 *   loading: true,
 *   error: null,
 * })
 */
export interface AsyncState<T> {
  /** The loaded data, or null if not yet loaded or on error. */
  data: T | null
  /** Whether the data is currently being loaded. */
  loading: boolean
  /** Error message if the operation failed, or null. */
  error: string | null
}
