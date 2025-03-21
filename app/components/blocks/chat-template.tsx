import { useState, useEffect, useRef } from "react"
// ** UI Components **
import {
  SidebarInset,
  useSidebar,
} from "~/components/blocks/sidebar"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { CardDescription, CardTitle } from "~/components/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// ** Icons **
import {
  Search,
  Send,
  Plus,
  UserPlus,
  Settings,
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react"
import { Textarea } from "../ui/textarea"
import ChatHeader from "./chatheader"

// ** Appwrite Services **
import {
  getUsers,
  getUserById,
  searchUsers,
  getMessages,
  sendMessage,
  markMessageAsRead,
  getLastMessages,
  type AppwriteUser,
  type UserData,
  type MessageData,
} from "~/lib/service"
import { account } from "~/lib/appwrite"

// ** Home Component **
export const Home = () => {
  const { toggleSidebar } = useSidebar()
  const [currentUser, setCurrentUser] = useState<AppwriteUser | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [lastMessages, setLastMessages] = useState<Record<string, MessageData>>({})
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageText, setMessageText] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Get current user and fetch users
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true)

        // Get current user
        const user = await account.get()
        setCurrentUser(user)

        // Fetch users from Appwrite
        const usersList = await getUsers()

        // Make sure we have unique users by userId
        const uniqueUsers = usersList.filter((user, index, self) =>
          index === self.findIndex(u => u.userId === user.userId)
        )

        setUsers(uniqueUsers)

        // Get last messages for each conversation
        try {
          const lastMsgs = await getLastMessages(user.$id)
          setLastMessages(lastMsgs)
        } catch (msgError) {
          console.error('Failed to load last messages:', msgError)
          // Continue without last messages
        }

        // Set first user as current chat if available
        if (uniqueUsers.length > 0) {
          setCurrentChat(uniqueUsers[0])
        }

      } catch (err) {
        console.error('Initialization error:', err)
        setError('Failed to load chat data. Please refresh and try again.')
        toast.error('Failed to load chat data')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  // Fetch messages when current chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser || !currentChat) return

      try {
        setLoadingMessages(true)

        // Fetch messages between current user and selected chat
        const messagesList = await getMessages(currentUser.$id, currentChat.userId)
        setMessages(messagesList)

        // Mark unread messages as read
        const unreadMessages = messagesList.filter(
          msg => !msg.read && msg.senderId === currentChat.userId
        )

        for (const msg of unreadMessages) {
          await markMessageAsRead(msg.$id)
        }

      } catch (err) {
        console.error('Error fetching messages:', err)

        // Check if it's a collection not found error
        if (err instanceof Error && err.message.includes('Messages collection not found')) {
          toast.error('Messages collection not found in Appwrite')
        } else {
          toast.error('Failed to load messages')
        }
      } finally {
        setLoadingMessages(false)

        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    }

    if (currentChat) {
      fetchMessages()
    }
  }, [currentUser, currentChat])

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        // If search is empty, load all users
        try {
          const usersList = await getUsers()

          // Make sure we have unique users by userId
          const uniqueUsers = usersList.filter((user, index, self) =>
            index === self.findIndex(u => u.userId === user.userId)
          )

          setUsers(uniqueUsers)
        } catch (err) {
          console.error('Error reloading users:', err)
          toast.error('Error searching users')
        }
        return
      }

      try {
        const searchResults = await searchUsers(searchQuery)

        // Make sure we have unique search results
        const uniqueResults = searchResults.filter((user, index, self) =>
          index === self.findIndex(u => u.userId === user.userId)
        )

        setUsers(uniqueResults)
      } catch (err) {
        console.error('Search error:', err)
        toast.error('Error searching users')
      }
    }

    // Use debounce to avoid too many requests
    const debounceTimeout = setTimeout(performSearch, 300)

    return () => clearTimeout(debounceTimeout)
  }, [searchQuery])

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !currentChat) return

    try {
      setSendingMessage(true)

      // Send message to Appwrite
      const newMessage = await sendMessage(
        currentUser.$id,
        currentChat.userId,
        messageText.trim()
      )

      // Update messages state
      setMessages(prev => [...prev, newMessage])

      // Update last messages state
      setLastMessages(prev => ({
        ...prev,
        [currentChat.userId]: newMessage
      }))

      // Clear input and scroll to bottom
      setMessageText("")
      scrollToBottom()

      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus()
      }

    } catch (err) {
      console.error('Error sending message:', err)

      // Check if it's a collection not found error
      if (err instanceof Error && err.message.includes('Messages collection not found')) {
        toast.error('Messages collection not found. Please create it in Appwrite.')
      } else {
        toast.error('Failed to send message')
      }
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Get user avatar or initials
  const getUserAvatar = (user: UserData) => {
    // You can modify this depending on how you store avatars
    return user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() || 'U'
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    // Otherwise show full date
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get message time
  const getMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get last message preview
  const getLastMessagePreview = (userId: string) => {
    const lastMessage = lastMessages[userId]
    if (!lastMessage) return null

    const isMyMessage = lastMessage.senderId === currentUser?.$id
    const preview = lastMessage.content.length > 25
      ? lastMessage.content.substring(0, 25) + '...'
      : lastMessage.content

    return {
      text: isMyMessage ? `You: ${preview}` : preview,
      timestamp: lastMessage.timestamp,
      read: lastMessage.read
    }
  }

  return (
    <>
      {/* Main Content */}
      <SidebarInset>
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {/* Left Panel - Chat List */}
          <ResizablePanel defaultSize={25} minSize={20} className="flex-grow">
            <div className="flex flex-col h-screen border-r">
              <div className="h-14 border-b px-3 py-2 flex items-center justify-between">
                <ChatHeader />
              </div>

              {/* Search Bar */}
              <div className="relative px-3 py-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users"
                    className="pl-9 pr-4 py-2 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* User List */}
              <ScrollArea className="flex-grow">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading users...</span>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-32 text-red-500">
                    <p>Error: {error}</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex justify-center items-center h-32">
                    <p>{searchQuery ? "No users found" : "No users available"}</p>
                  </div>
                ) : (
                  <div className="pt-1">
                    {users.map((user, index) => {
                      const lastMessage = getLastMessagePreview(user.userId)
                      return (
                        <button
                          key={`${user.userId}-${index}`}
                          onClick={() => setCurrentChat(user)}
                          className={`px-3 w-full py-2 hover:bg-secondary cursor-pointer text-left transition-colors ${currentChat?.userId === user.userId ? 'bg-secondary' : ''
                            }`}
                        >
                          <div className="flex flex-row gap-3 items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{getUserAvatar(user)}</AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden flex-1">
                              <div className="flex justify-between items-center w-full">
                                <CardTitle className="text-base truncate">
                                  {user.name || user.email || "Unknown User"}
                                </CardTitle>
                                {lastMessage && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
                                    {formatDate(lastMessage.timestamp)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-1">
                                {lastMessage ? (
                                  <>
                                    <CardDescription className="truncate flex-1 text-sm">
                                      {lastMessage.text}
                                    </CardDescription>
                                    {lastMessage.read ? (
                                      <CheckCheck className="h-4 w-4 text-primary ml-1 flex-shrink-0" />
                                    ) : (
                                      <Check className="h-4 w-4 text-muted-foreground ml-1 flex-shrink-0" />
                                    )}
                                  </>
                                ) : (
                                  <CardDescription className="truncate text-sm">
                                    {user.provider} user
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Chat Window */}
          <ResizablePanel defaultSize={75} minSize={40}>
            <div className="flex flex-col h-screen">
              {/* Chat Header */}
              {currentChat ? (
                <div className="h-14 border-b flex items-center justify-between px-4">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getUserAvatar(currentChat)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <CardTitle className="text-base">
                        {currentChat.name || currentChat.email || "Unknown User"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Last active: {formatDate(currentChat.lastLogin)}
                      </CardDescription>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-1">
                    <button className="p-2 rounded-full hover:bg-secondary">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-secondary">
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div> */}
                </div>
              ) : (
                <div className="h-14 border-b flex items-center px-4">
                  <p>Select a contact to start chatting</p>
                </div>
              )}

              {/* Chat Messages Area */}
              <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                {!currentChat ? (
                  <div className="flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Welcome to the Chat App</h3>
                      <p className="text-muted-foreground mt-2">
                        Select a user from the left to start a conversation
                      </p>
                    </div>
                  </div>
                ) : loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <div className="mb-4">
                        <Avatar className="h-16 w-16 mx-auto">
                          <AvatarFallback className="text-xl">{getUserAvatar(currentChat)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-medium mt-2">
                          {currentChat.name || currentChat.email || "Unknown User"}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          User since {formatDate(currentChat.registrationDate)}
                        </p>
                      </div>
                      <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {messages.map((message) => {
                      const isMyMessage = message.senderId === currentUser?.$id;
                      return (
                        <div
                          key={message.$id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${isMyMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                              }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <div className="flex items-center justify-end mt-1 gap-1">
                              <span className="text-xs opacity-70">
                                {getMessageTime(message.timestamp)}
                              </span>
                              {isMyMessage && (
                                message.read ? (
                                  <CheckCheck className="h-3 w-3 text-primary-foreground" />
                                ) : (
                                  <Check className="h-3 w-3 text-primary-foreground opacity-70" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              <div className="flex items-center p-3 border-t">
                <div className="flex-grow relative">
                  <Textarea
                    ref={textareaRef}
                    className="resize-none py-2 pl-3 pr-10 min-h-[44px] max-h-[120px] w-full"
                    placeholder="Type a message"
                    rows={1}
                    disabled={!currentChat || sendingMessage}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <button
                  className="ml-2 p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentChat || !messageText.trim() || sendingMessage}
                  onClick={handleSendMessage}
                >
                  {sendingMessage ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </>
  )
}

export default Home