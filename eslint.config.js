import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'supabase/functions/**', '.claude/**', '.planning/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Regra nova/experimental que dispara em chamadas legítimas a Date.now()
      // e performance.now() dentro de handlers async e mutações (não durante render).
      'react-hooks/purity': 'off',
      // react-hook-form expõe `watch()` propositalmente; a regra é zelosa demais.
      'react-hooks/incompatible-library': 'off',
      // Animation pattern em Modal usa setState em useEffect propositalmente
      // (entrar/sair com transição de duas frames). Não é cascading render.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // O router define wrappers internos (shells) no mesmo arquivo. Fast refresh
    // não é crítico para um arquivo de definição de rotas.
    files: ['src/app/router.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
