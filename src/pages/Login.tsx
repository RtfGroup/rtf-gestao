import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar() {
    setCarregando(true)
    setMensagem('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setMensagem('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    navigate('/produtos')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f172a',
      }}
    >
      <div
        style={{
          width: '360px',
          padding: '32px',
          background: '#ffffff',
          borderRadius: '12px',
        }}
      >
        <h1>RTF Gestão</h1>
        <p>Acesse sua conta</p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') {
              entrar()
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '12px',
          }}
        />

        <button
          onClick={entrar}
          disabled={carregando}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        {mensagem && <p>{mensagem}</p>}
      </div>
    </div>
  )
}

export default Login