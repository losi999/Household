module.exports = {
  overrides: [
    {
      files: [
        '*.ts'
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          'tsconfig.json',
          'e2e/tsconfig.json'
        ],
        createDefaultProgram: true
      },
      plugins: ['@angular-eslint'],
      rules: {
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase'
          }
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case'
          }
        ]
      }
    }
  ]
}
