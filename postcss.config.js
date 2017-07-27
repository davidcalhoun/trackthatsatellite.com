module.exports = {
    plugins: [
      // Inlines @import rules.
      require('postcss-import'),

      // Enables advanced new CSS shininess.  http://cssnext.io/
      require('postcss-cssnext')({ browsers: ['last 2 versions', 'IE > 10'] }),

      // Logs PostCSS warnings and errors to the console.
      require('postcss-reporter')({ clearMessages: true })
    ]
}

