import next from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const eslintConfig = [
  {
    // components/ui and hooks are vendored shadcn/ui boilerplate — lint our own code only.
    ignores: ['node_modules/**', '.next/**', 'next-env.d.ts', 'components/ui/**', 'hooks/**'],
  },
  ...next,
  ...typescript,
  {
    rules: {
      // Literal quotes/apostrophes in JSX text render fine; this rule is noise.
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default eslintConfig
