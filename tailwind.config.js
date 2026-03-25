export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d7efff',
          200: '#adddff',
          300: '#74c3ff',
          400: '#35a4fb',
          500: '#0f8ae8',
          600: '#056cbe',
          700: '#065596',
          800: '#0b497c',
          900: '#103e67'
        }
      },
      boxShadow: {
        glass: '0 24px 80px rgba(14, 71, 126, 0.22)'
      },
      backgroundImage: {
        medical:
          'radial-gradient(circle at top left, rgba(255,255,255,0.32), transparent 28%), linear-gradient(135deg, #0d5fbb 0%, #1ba7de 45%, #85d7ff 100%)'
      }
    }
  },
  plugins: []
};

