import { useEffect, useState } from 'react'

import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material'

import NotificationsIcon from '@mui/icons-material/Notifications'

import { supabase } from '../../lib/supabase'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  modulo: string
  lida: boolean
  criada_em: string
}

export default function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [carregando, setCarregando] = useState(false)
  const [ancora, setAncora] = useState<HTMLElement | null>(null)

  const quantidadeNaoLidas = notificacoes.filter(
    (notificacao) => !notificacao.lida,
  ).length

useEffect(() => {
  if (
    'Notification' in window &&
    Notification.permission === 'default'
  ) {
    void Notification.requestPermission()
  }
}, [])
  
useEffect(() => {
  void carregarNotificacoes()

  const canal = supabase
    .channel('notificacoes-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
      },
      (payload) => {
  void carregarNotificacoes()

  const nova = payload.new as Partial<Notificacao>

  if (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    nova.titulo
  ) {
    new Notification(nova.titulo, {
      body: nova.mensagem ?? 'Nova notificação no RTF Gestão.',
    })
  }
},
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(canal)
  }
}, [])

  async function carregarNotificacoes() {
    try {
      setCarregando(true)

      const { data, error } = await supabase
        .from('notificacoes')
        .select(`
          id,
          titulo,
          mensagem,
          tipo,
          modulo,
          lida,
          criada_em
        `)
        .eq('lida', false)
        .order('criada_em', { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      setNotificacoes((data ?? []) as Notificacao[])
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setCarregando(false)
    }
  }

  async function marcarComoLida(notificacao: Notificacao) {
    if (notificacao.lida) {
      return
    }

    const { error } = await supabase
      .from('notificacoes')
      .update({
        lida: true,
        lida_em: new Date().toISOString(),
      })
      .eq('id', notificacao.id)

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      return
    }

    setNotificacoes((atuais) =>
  atuais.filter(
    (item) => item.id !== notificacao.id,
  ),
)
  }

  return (
    <>
      <IconButton
  onClick={(event) => {
    setAncora(event.currentTarget)
    void carregarNotificacoes()
  }}
  sx={{
    color: '#f8fafc',

    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.06)',
    },
  }}
>
        <Badge
          badgeContent={quantidadeNaoLidas}
          color="error"
          max={99}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={ancora}
        open={Boolean(ancora)}
        onClose={() => setAncora(null)}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              maxHeight: 480,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Notificações
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {quantidadeNaoLidas} não lida(s)
          </Typography>
        </Box>

        <Divider />

        {carregando ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : notificacoes.length === 0 ? (
          <Typography
            sx={{
              px: 2,
              py: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            Nenhuma notificação.
          </Typography>
        ) : (
          <List disablePadding>
            {notificacoes.map((notificacao) => (
              <ListItemButton
                key={notificacao.id}
                onClick={() => void marcarComoLida(notificacao)}
                sx={{
                  alignItems: 'flex-start',
                  backgroundColor: notificacao.lida
                    ? 'transparent'
                    : 'action.hover',
                }}
              >
<ListItemText
  primary={
<Typography
  component="span"
  sx={{
    fontWeight: notificacao.lida ? 400 : 700,
  }}
>
  {notificacao.titulo}
</Typography>
  }
  secondary={notificacao.mensagem}
/>
              </ListItemButton>
            ))}
          </List>
        )}
      </Menu>
    </>
  )
}