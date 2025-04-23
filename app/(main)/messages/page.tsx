import { MessageSquare, Search } from "lucide-react"

export default function MessagesPage() {
  const conversations = [
    {
      id: 1,
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thanks for the help with the lecture!",
      time: "2m ago",
      unread: 2,
    },
    {
      id: 2,
      name: "Robert Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "When is the next study group?",
      time: "1h ago",
      unread: 0,
    },
    {
      id: 3,
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "I've shared my notes with you",
      time: "5h ago",
      unread: 0,
    },
    {
      id: 4,
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Can you explain the last concept again?",
      time: "1d ago",
      unread: 0,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search messages"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {conversations.length > 0 ? (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 flex items-center hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="relative mr-3">
                  <img
                    src={conversation.avatar || "/placeholder.svg"}
                    alt={conversation.name}
                    className="h-12 w-12 rounded-full"
                  />
                  {conversation.unread > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
            <p className="text-gray-500 mt-1">Start a conversation with your peers!</p>
          </div>
        )}
      </div>
    </div>
  )
}

