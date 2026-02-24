import type { FormSchema } from '@/types'

/** Anamnese nutricional - template padrão do sistema */
export const nutritionAnamnesisTemplate: FormSchema = {
  title: 'Anamnese Nutricional',
  description: 'Formulário de avaliação nutricional inicial',
  version: 1,
  sections: [
    {
      title: 'Dados Pessoais',
      description: 'Informações básicas do paciente',
      fields: [
        { id: 'birth_date', type: 'date', label: 'Data de Nascimento', required: true, order: 1 },
        { id: 'gender', type: 'select', label: 'Sexo', required: true, order: 2, options: [
          { label: 'Feminino', value: 'female' },
          { label: 'Masculino', value: 'male' },
          { label: 'Outro', value: 'other' },
        ]},
        { id: 'occupation', type: 'text', label: 'Profissão', required: false, order: 3 },
        { id: 'physical_activity', type: 'select', label: 'Nível de Atividade Física', required: true, order: 4, options: [
          { label: 'Sedentário', value: 'sedentary' },
          { label: 'Leve (1-2x/semana)', value: 'light' },
          { label: 'Moderado (3-4x/semana)', value: 'moderate' },
          { label: 'Intenso (5+x/semana)', value: 'intense' },
        ]},
        { id: 'activity_type', type: 'text', label: 'Tipo de Atividade', required: false, order: 5, placeholder: 'Ex: Musculação, Corrida, Yoga...' },
      ],
    },
    {
      title: 'Histórico de Saúde',
      fields: [
        { id: 'health_conditions', type: 'checkbox', label: 'Condições de Saúde', required: false, order: 1, options: [
          { label: 'Diabetes', value: 'diabetes' },
          { label: 'Hipertensão', value: 'hypertension' },
          { label: 'Colesterol alto', value: 'high_cholesterol' },
          { label: 'Problemas de tireoide', value: 'thyroid' },
          { label: 'Problemas gastrointestinais', value: 'gastrointestinal' },
          { label: 'Alergias alimentares', value: 'food_allergies' },
        ]},
        { id: 'allergies_detail', type: 'textarea', label: 'Detalhe as alergias/intolerâncias', required: false, order: 2, placeholder: 'Descreva suas alergias alimentares e intolerâncias...', width: 'full' },
        { id: 'medications', type: 'textarea', label: 'Medicamentos em uso', required: false, order: 3, placeholder: 'Liste os medicamentos que está tomando...', width: 'full' },
        { id: 'supplements', type: 'textarea', label: 'Suplementos em uso', required: false, order: 4, placeholder: 'Liste os suplementos que está tomando...' , width: 'full'},
      ],
    },
    {
      title: 'Hábitos Alimentares',
      fields: [
        { id: 'meals_per_day', type: 'select', label: 'Quantas refeições por dia?', required: true, order: 1, options: [
          { label: '1-2 refeições', value: '1-2' },
          { label: '3 refeições', value: '3' },
          { label: '4-5 refeições', value: '4-5' },
          { label: '6+ refeições', value: '6+' },
        ]},
        { id: 'water_intake', type: 'select', label: 'Consumo de água diário', required: true, order: 2, options: [
          { label: 'Menos de 1 litro', value: 'less_1l' },
          { label: '1-2 litros', value: '1-2l' },
          { label: '2-3 litros', value: '2-3l' },
          { label: 'Mais de 3 litros', value: 'more_3l' },
        ]},
        { id: 'food_preferences', type: 'textarea', label: 'Preferências alimentares', required: false, order: 3, placeholder: 'Alimentos que mais gosta...', width: 'full' },
        { id: 'food_restrictions', type: 'textarea', label: 'Restrições alimentares', required: false, order: 4, placeholder: 'Alimentos que não come ou não gosta...', width: 'full' },
        { id: 'typical_day', type: 'textarea', label: 'Descreva um dia alimentar típico', required: true, order: 5, placeholder: 'Café da manhã: ...\nLanche: ...\nAlmoço: ...\nLanche: ...\nJantar: ...', width: 'full' },
      ],
    },
    {
      title: 'Medidas Corporais',
      description: 'Serão preenchidas pelo profissional',
      fields: [
        { id: 'weight', type: 'number', label: 'Peso (kg)', required: false, order: 1, validation: { min: 20, max: 300 } },
        { id: 'height', type: 'number', label: 'Altura (cm)', required: false, order: 2, validation: { min: 100, max: 250 } },
        { id: 'waist', type: 'number', label: 'Circunferência abdominal (cm)', required: false, order: 3 },
        { id: 'hip', type: 'number', label: 'Circunferência do quadril (cm)', required: false, order: 4 },
      ],
    },
    {
      title: 'Objetivos',
      fields: [
        { id: 'main_goal', type: 'select', label: 'Objetivo principal', required: true, order: 1, options: [
          { label: 'Emagrecimento', value: 'weight_loss' },
          { label: 'Ganho de massa muscular', value: 'muscle_gain' },
          { label: 'Manutenção de peso', value: 'maintenance' },
          { label: 'Melhoria da saúde geral', value: 'health' },
          { label: 'Performance esportiva', value: 'performance' },
          { label: 'Tratamento de condição específica', value: 'treatment' },
        ]},
        { id: 'goal_detail', type: 'textarea', label: 'Descreva seus objetivos em detalhes', required: false, order: 2, placeholder: 'O que você espera alcançar com o acompanhamento nutricional?', width: 'full' },
        { id: 'urgency', type: 'scale', label: 'Nível de motivação (1-10)', required: false, order: 3, validation: { min: 1, max: 10 } },
      ],
    },
  ],
}

/** Anamnese psicológica - template padrão do sistema */
export const psychologyAnamnesisTemplate: FormSchema = {
  title: 'Anamnese Psicológica',
  description: 'Formulário de avaliação psicológica inicial',
  version: 1,
  sections: [
    {
      title: 'Dados Pessoais',
      fields: [
        { id: 'birth_date', type: 'date', label: 'Data de Nascimento', required: true, order: 1 },
        { id: 'marital_status', type: 'select', label: 'Estado Civil', required: false, order: 2, options: [
          { label: 'Solteiro(a)', value: 'single' },
          { label: 'Casado(a)', value: 'married' },
          { label: 'Divorciado(a)', value: 'divorced' },
          { label: 'Viúvo(a)', value: 'widowed' },
          { label: 'União estável', value: 'common_law' },
        ]},
        { id: 'occupation', type: 'text', label: 'Profissão', required: false, order: 3 },
        { id: 'education', type: 'select', label: 'Escolaridade', required: false, order: 4, options: [
          { label: 'Ensino Fundamental', value: 'elementary' },
          { label: 'Ensino Médio', value: 'high_school' },
          { label: 'Ensino Superior', value: 'college' },
          { label: 'Pós-graduação', value: 'post_grad' },
        ]},
      ],
    },
    {
      title: 'Motivo da Consulta',
      fields: [
        { id: 'main_complaint', type: 'textarea', label: 'Queixa principal', required: true, order: 1, placeholder: 'Descreva o motivo que o(a) levou a buscar acompanhamento psicológico...', width: 'full' },
        { id: 'symptom_duration', type: 'text', label: 'Há quanto tempo apresenta esses sintomas?', required: false, order: 2 },
        { id: 'previous_therapy', type: 'select', label: 'Já fez terapia antes?', required: true, order: 3, options: [
          { label: 'Não, é minha primeira vez', value: 'no' },
          { label: 'Sim, mas parei', value: 'yes_stopped' },
          { label: 'Sim, ainda faço com outro profissional', value: 'yes_current' },
        ]},
        { id: 'previous_therapy_detail', type: 'textarea', label: 'Conte sobre a experiência anterior', required: false, order: 4, conditionalOn: { fieldId: 'previous_therapy', value: 'yes_stopped', operator: 'equals' }, width: 'full' },
      ],
    },
    {
      title: 'Histórico de Saúde',
      fields: [
        { id: 'psychiatric_history', type: 'select', label: 'Já teve acompanhamento psiquiátrico?', required: true, order: 1, options: [
          { label: 'Não', value: 'no' },
          { label: 'Sim, atualmente', value: 'yes_current' },
          { label: 'Sim, no passado', value: 'yes_past' },
        ]},
        { id: 'medications', type: 'textarea', label: 'Medicamentos em uso (psiquiátricos ou outros)', required: false, order: 2, width: 'full' },
        { id: 'sleep_quality', type: 'scale', label: 'Qualidade do sono (1-10)', required: false, order: 3, validation: { min: 1, max: 10 } },
        { id: 'physical_activity', type: 'select', label: 'Pratica atividade física?', required: false, order: 4, options: [
          { label: 'Não pratico', value: 'none' },
          { label: 'Raramente', value: 'rarely' },
          { label: 'Regularmente', value: 'regular' },
        ]},
      ],
    },
    {
      title: 'Contexto Atual',
      fields: [
        { id: 'life_events', type: 'textarea', label: 'Acontecimentos recentes importantes', required: false, order: 1, placeholder: 'Mudanças, perdas, conflitos, conquistas...', width: 'full' },
        { id: 'support_network', type: 'textarea', label: 'Rede de apoio', required: false, order: 2, placeholder: 'Com quem você conta? Família, amigos...', width: 'full' },
        { id: 'expectations', type: 'textarea', label: 'O que espera do acompanhamento?', required: true, order: 3, placeholder: 'Quais resultados gostaria de alcançar?', width: 'full' },
        { id: 'availability', type: 'select', label: 'Disponibilidade de horário', required: false, order: 4, options: [
          { label: 'Manhã', value: 'morning' },
          { label: 'Tarde', value: 'afternoon' },
          { label: 'Noite', value: 'evening' },
          { label: 'Flexível', value: 'flexible' },
        ]},
      ],
    },
  ],
}

/** Ficha clínica geral - template padrão do sistema */
export const generalClinicalTemplate: FormSchema = {
  title: 'Ficha Clínica Geral',
  description: 'Formulário padrão de consulta médica',
  version: 1,
  sections: [
    {
      title: 'Informações Gerais',
      fields: [
        { id: 'birth_date', type: 'date', label: 'Data de Nascimento', required: true, order: 1 },
        { id: 'gender', type: 'select', label: 'Sexo', required: true, order: 2, options: [
          { label: 'Feminino', value: 'female' },
          { label: 'Masculino', value: 'male' },
          { label: 'Outro', value: 'other' },
        ]},
        { id: 'blood_type', type: 'select', label: 'Tipo Sanguíneo', required: false, order: 3, options: [
          { label: 'A+', value: 'a_pos' }, { label: 'A-', value: 'a_neg' },
          { label: 'B+', value: 'b_pos' }, { label: 'B-', value: 'b_neg' },
          { label: 'AB+', value: 'ab_pos' }, { label: 'AB-', value: 'ab_neg' },
          { label: 'O+', value: 'o_pos' }, { label: 'O-', value: 'o_neg' },
          { label: 'Não sei', value: 'unknown' },
        ]},
        { id: 'emergency_contact', type: 'text', label: 'Contato de Emergência', required: false, order: 4, placeholder: 'Nome e telefone' },
      ],
    },
    {
      title: 'Queixa Principal',
      fields: [
        { id: 'main_complaint', type: 'textarea', label: 'Queixa principal', required: true, order: 1, placeholder: 'Descreva o motivo da consulta...', width: 'full' },
        { id: 'symptom_onset', type: 'text', label: 'Início dos sintomas', required: false, order: 2 },
        { id: 'pain_level', type: 'scale', label: 'Nível de dor (0-10)', required: false, order: 3, validation: { min: 0, max: 10 } },
      ],
    },
    {
      title: 'Histórico Médico',
      fields: [
        { id: 'chronic_conditions', type: 'checkbox', label: 'Condições crônicas', required: false, order: 1, options: [
          { label: 'Diabetes', value: 'diabetes' },
          { label: 'Hipertensão', value: 'hypertension' },
          { label: 'Asma', value: 'asthma' },
          { label: 'Cardiopatia', value: 'heart_disease' },
          { label: 'Depressão/Ansiedade', value: 'mental_health' },
          { label: 'Nenhuma', value: 'none' },
        ]},
        { id: 'surgeries', type: 'textarea', label: 'Cirurgias anteriores', required: false, order: 2, width: 'full' },
        { id: 'family_history', type: 'textarea', label: 'Histórico familiar', required: false, order: 3, placeholder: 'Doenças na família (pais, irmãos, avós)...', width: 'full' },
        { id: 'current_medications', type: 'textarea', label: 'Medicamentos em uso', required: false, order: 4, width: 'full' },
        { id: 'allergies', type: 'textarea', label: 'Alergias conhecidas', required: false, order: 5, placeholder: 'Medicamentos, alimentos, substâncias...', width: 'full' },
      ],
    },
    {
      title: 'Hábitos de Vida',
      fields: [
        { id: 'smoking', type: 'select', label: 'Tabagismo', required: false, order: 1, options: [
          { label: 'Nunca fumou', value: 'never' },
          { label: 'Ex-fumante', value: 'former' },
          { label: 'Fumante', value: 'current' },
        ]},
        { id: 'alcohol', type: 'select', label: 'Consumo de álcool', required: false, order: 2, options: [
          { label: 'Não consome', value: 'none' },
          { label: 'Socialmente', value: 'social' },
          { label: 'Regularmente', value: 'regular' },
        ]},
        { id: 'exercise', type: 'select', label: 'Atividade física', required: false, order: 3, options: [
          { label: 'Sedentário', value: 'sedentary' },
          { label: '1-2x/semana', value: 'light' },
          { label: '3-4x/semana', value: 'moderate' },
          { label: '5+x/semana', value: 'intense' },
        ]},
        { id: 'sleep_hours', type: 'number', label: 'Horas de sono por noite', required: false, order: 4, validation: { min: 1, max: 24 } },
      ],
    },
  ],
}

/** Mapa de templates por especialidade */
export const systemTemplatesBySpecialty: Record<string, FormSchema> = {
  nutricao: nutritionAnamnesisTemplate,
  psicologia: psychologyAnamnesisTemplate,
  'medicina-geral': generalClinicalTemplate,
  cardiologia: generalClinicalTemplate,
  dermatologia: generalClinicalTemplate,
  endocrinologia: generalClinicalTemplate,
  pediatria: generalClinicalTemplate,
  psiquiatria: psychologyAnamnesisTemplate,
  fisioterapia: generalClinicalTemplate,
  fonoaudiologia: generalClinicalTemplate,
}
