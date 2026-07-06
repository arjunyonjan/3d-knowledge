import { render } from 'preact'
import App from './App.jsx'

const app = document.getElementById('app')
if (app) render(<App />, app)

const loader = document.getElementById('loader')
if (loader) loader.style.display = 'none'
