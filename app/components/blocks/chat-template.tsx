import { useState } from "react"
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
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/react-router'

// ** Icons **
import {
  Search,
} from "lucide-react"
import { Textarea } from "../ui/textarea"

// ** Contact List **
const contactList = [
  {
    name: "Vijay Dabhi",
    message: "Your Last Message Here",
    image: "https://avatars.githubusercontent.com/u/80666494?v=4&size=64",
  },
  {
    name: "Anjali Kumar",
    message: "Hello, how are you?",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  }
]

// ** Home Component **
export const Home = () => {
  const { toggleSidebar } = useSidebar()
  const [currentChat, setCurrentChat] = useState(contactList[0])

  return (
    <>

      {/* Main Content */}
      <SidebarInset>
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {/* Left Panel - Chat List */}
          <ResizablePanel defaultSize={25} minSize={20} className="flex-grow">
            <div className="flex flex-col h-screen border ml-1">
              <div className="h-10 px-2 py-4 flex items-center">
                <p className="ml-1">Chats</p>
                <div className="flex justify-end w-full">
                  <SignedOut>
                    <SignInButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>

              </div>

              {/* Search Bar */}
              <div className="relative px-2 py-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                <Input
                  placeholder="Search or start new chat"
                  className="pl-10"
                />
              </div>

              {/* Contact List */}
              <ScrollArea className="flex-grow">
                {contactList.map((contact, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentChat(contact)}
                    className="px-4 w-full py-2 hover:bg-secondary cursor-pointer text-left"
                  >
                    <div className="flex flex-row gap-2">
                      <Avatar className="size-12">
                        <AvatarImage src={contact.image} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <CardTitle>{contact.name}</CardTitle>
                        <CardDescription>{contact.message}</CardDescription>
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Chat Window */}
          <ResizablePanel defaultSize={75} minSize={40}>
            <div className="flex flex-col justify-between h-screen ml-1 pb-2">
              {/* Chat Header */}
              <div className="h-16 border-b flex items-center px-3">
                <Avatar className="size-12">
                  <AvatarImage src={currentChat?.image} />
                  <AvatarFallback>PR</AvatarFallback>
                </Avatar>
                <div className="space-y-1 ml-2">
                  <CardTitle>{currentChat?.name}</CardTitle>
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex h-10 pt-2 border-t mb-10">
                <Textarea
                  className="flex-grow border-0"
                  placeholder="Type a message"
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </>
  )
}
