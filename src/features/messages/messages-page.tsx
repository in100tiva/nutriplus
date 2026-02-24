import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Send,
  Paperclip,
  ArrowLeft,
  MessageCircle,
  Check,
  CheckCheck,
} from 'lucide-react'
import {
  Button,
  Input,
  Avatar,
  Badge,
  EmptyState,
} from '@/components/ui'
import { cn } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

interface Contact {
  id: string
  name: string
  avatar: string | null
  role: 'professional' | 'patient'
  specialty?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  online: boolean
}

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  attachment?: {
    name: string
    size: string
    type: string
  }
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const CURRENT_USER_ID = 'user-1'

const MOCK_CONTACTS: Contact[] = [
  {
    id: 'prof-1',
    name: 'Dra. Ana Carolina Mendes',
    avatar: null,
    role: 'professional',
    specialty: 'Nutricionista Clinico',
    lastMessage: 'Otimo! Vou preparar seu novo plano alimentar ate amanha.',
    lastMessageTime: '14:32',
    unreadCount: 2,
    online: true,
  },
  {
    id: 'prof-2',
    name: 'Dra. Juliana Costa Ferreira',
    avatar: null,
    role: 'professional',
    specialty: 'Nutricionista Esportivo',
    lastMessage: 'Nao esqueca de hidratar bem antes do treino!',
    lastMessageTime: '11:15',
    unreadCount: 0,
    online: false,
  },
  {
    id: 'prof-3',
    name: 'Dr. Rafael Oliveira Santos',
    avatar: null,
    role: 'professional',
    specialty: 'Nutrologo',
    lastMessage: 'Os resultados dos exames ficaram excelentes. Parabens!',
    lastMessageTime: 'Ontem',
    unreadCount: 0,
    online: false,
  },
  {
    id: 'prof-4',
    name: 'Dra. Mariana Souza Alves',
    avatar: null,
    role: 'professional',
    specialty: 'Nutricionista Materno-Infantil',
    lastMessage: 'Segue a receita da papinha que conversamos.',
    lastMessageTime: 'Seg',
    unreadCount: 1,
    online: true,
  },
  {
    id: 'prof-5',
    name: 'Dr. Pedro Henrique Lima',
    avatar: null,
    role: 'professional',
    specialty: 'Endocrinologista',
    lastMessage: 'Pode agendar o retorno para daqui a 30 dias.',
    lastMessageTime: '18/02',
    unreadCount: 0,
    online: false,
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  'prof-1': [
    {
      id: 'm1',
      senderId: 'prof-1',
      text: 'Ola! Como voce esta se sentindo com o novo plano alimentar?',
      timestamp: '14:00',
      status: 'read',
    },
    {
      id: 'm2',
      senderId: CURRENT_USER_ID,
      text: 'Oi Dra. Ana! Estou me sentindo muito bem. Consegui seguir direitinho essa semana toda!',
      timestamp: '14:05',
      status: 'read',
    },
    {
      id: 'm3',
      senderId: 'prof-1',
      text: 'Que maravilha! Alguma dificuldade com alguma receita ou substituicao?',
      timestamp: '14:08',
      status: 'read',
    },
    {
      id: 'm4',
      senderId: CURRENT_USER_ID,
      text: 'So tive um pouco de dificuldade com o lanche da tarde. As vezes nao da tempo de preparar a receita que voce sugeriu.',
      timestamp: '14:12',
      status: 'read',
    },
    {
      id: 'm5',
      senderId: 'prof-1',
      text: 'Entendo! Vou incluir opcoes mais praticas para o lanche da tarde. Que tal frutas com pasta de amendoim ou iogurte com granola?',
      timestamp: '14:18',
      status: 'read',
    },
    {
      id: 'm6',
      senderId: CURRENT_USER_ID,
      text: 'Perfeito! Adoro iogurte com granola. Pode incluir sim!',
      timestamp: '14:22',
      status: 'read',
    },
    {
      id: 'm7',
      senderId: CURRENT_USER_ID,
      text: 'Ah, e queria saber se posso comer sushi no sabado? Temos um jantar em familia.',
      timestamp: '14:25',
      status: 'delivered',
    },
    {
      id: 'm8',
      senderId: 'prof-1',
      text: 'Claro! O sushi e uma otima opcao. So evite os que tem cream cheese e as versoes fritas (hot rolls). Prefira os de peixe fresco.',
      timestamp: '14:28',
      status: 'read',
    },
    {
      id: 'm9',
      senderId: 'prof-1',
      text: 'Otimo! Vou preparar seu novo plano alimentar ate amanha.',
      timestamp: '14:32',
      status: 'read',
    },
  ],
  'prof-2': [
    {
      id: 'm10',
      senderId: CURRENT_USER_ID,
      text: 'Bom dia Dra. Juliana! Fiz o treino de ontem e senti uma fadiga forte no final.',
      timestamp: '10:45',
      status: 'read',
    },
    {
      id: 'm11',
      senderId: 'prof-2',
      text: 'Bom dia! Isso pode estar relacionado a hidratacao. Quanto de agua voce tomou antes e durante o treino?',
      timestamp: '10:58',
      status: 'read',
    },
    {
      id: 'm12',
      senderId: CURRENT_USER_ID,
      text: 'Acho que tomei so uns 300ml antes...',
      timestamp: '11:02',
      status: 'read',
    },
    {
      id: 'm13',
      senderId: 'prof-2',
      text: 'Nao esqueca de hidratar bem antes do treino!',
      timestamp: '11:15',
      status: 'read',
    },
  ],
  'prof-3': [
    {
      id: 'm14',
      senderId: 'prof-3',
      text: 'Os resultados dos exames ficaram excelentes. Parabens!',
      timestamp: '15:30',
      status: 'read',
    },
    {
      id: 'm15',
      senderId: CURRENT_USER_ID,
      text: 'Que alivio! Obrigado por acompanhar tao de perto, Dr. Rafael.',
      timestamp: '16:00',
      status: 'read',
    },
  ],
}

/* ─── Component ───────────────────────────────────────────────── */

export function MessagesPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [mobileShowConversation, setMobileShowConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedContact = MOCK_CONTACTS.find((c) => c.id === selectedContactId)
  const messages = selectedContactId ? MOCK_MESSAGES[selectedContactId] ?? [] : []

  const filteredContacts = searchQuery.trim()
    ? MOCK_CONTACTS.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : MOCK_CONTACTS

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, selectedContactId])

  function handleSelectContact(contactId: string) {
    setSelectedContactId(contactId)
    setMobileShowConversation(true)
  }

  function handleSendMessage() {
    if (!messageInput.trim()) return
    // In a real app, this would send the message
    setMessageInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* ─── Contact List ─────────────────────────────────────── */}
      <div
        className={cn(
          'flex w-full flex-col border-r border-gray-200 md:w-80 lg:w-96',
          mobileShowConversation ? 'hidden md:flex' : 'flex',
        )}
      >
        {/* Search header */}
        <div className="border-b border-gray-200 p-4">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Mensagens</h2>
          <Input
            placeholder="Buscar conversa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Nenhuma conversa encontrada
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleSelectContact(contact.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                  selectedContactId === contact.id && 'bg-blue-50',
                )}
              >
                <Avatar
                  name={contact.name}
                  src={contact.avatar}
                  size="md"
                  status={contact.online ? 'online' : 'offline'}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {contact.name}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {contact.lastMessageTime}
                    </span>
                  </div>
                  {contact.specialty && (
                    <p className="text-xs text-blue-500">{contact.specialty}</p>
                  )}
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-bold text-white">
                    {contact.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Conversation Panel ───────────────────────────────── */}
      <div
        className={cn(
          'flex flex-1 flex-col',
          !mobileShowConversation ? 'hidden md:flex' : 'flex',
        )}
      >
        {selectedContact ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
              <button
                type="button"
                className="md:hidden"
                onClick={() => setMobileShowConversation(false)}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Avatar
                name={selectedContact.name}
                src={selectedContact.avatar}
                size="md"
                status={selectedContact.online ? 'online' : 'offline'}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {selectedContact.name}
                </p>
                <div className="flex items-center gap-2">
                  {selectedContact.specialty && (
                    <Badge variant="info" size="sm">
                      {selectedContact.specialty}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {selectedContact.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
              <div className="mx-auto max-w-3xl space-y-3">
                {messages.map((message) => {
                  const isSent = message.senderId === CURRENT_USER_ID

                  return (
                    <div
                      key={message.id}
                      className={cn('flex', isSent ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2.5',
                          isSent
                            ? 'rounded-br-md bg-blue-500 text-white'
                            : 'rounded-bl-md bg-white text-gray-900 shadow-sm',
                        )}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>

                        {message.attachment && (
                          <div
                            className={cn(
                              'mt-2 flex items-center gap-2 rounded-lg p-2',
                              isSent ? 'bg-blue-400/30' : 'bg-gray-50',
                            )}
                          >
                            <Paperclip className="h-4 w-4" />
                            <div>
                              <p className="text-xs font-medium">{message.attachment.name}</p>
                              <p className="text-[10px] opacity-70">{message.attachment.size}</p>
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            'mt-1 flex items-center gap-1',
                            isSent ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <span
                            className={cn(
                              'text-[10px]',
                              isSent ? 'text-blue-100' : 'text-gray-400',
                            )}
                          >
                            {message.timestamp}
                          </span>
                          {isSent && (
                            <span>
                              {message.status === 'read' ? (
                                <CheckCheck className="h-3 w-3 text-blue-100" />
                              ) : (
                                <Check className="h-3 w-3 text-blue-200" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-gray-200 bg-white px-4 py-3">
              <div className="mx-auto flex max-w-3xl items-center gap-2">
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Button
                  size="sm"
                  disabled={!messageInput.trim()}
                  onClick={handleSendMessage}
                  className="shrink-0 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<MessageCircle className="h-6 w-6" />}
              title="Selecione uma conversa"
              description="Escolha um contato ao lado para iniciar ou continuar uma conversa."
            />
          </div>
        )}
      </div>
    </div>
  )
}
