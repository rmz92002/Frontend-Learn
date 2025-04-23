import { Bell } from "lucide-react"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "New course available",
      message: "A new course on Neural Networks has been added",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Assignment reminder",
      message: "Your Programming Basics assignment is due tomorrow",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      title: "Achievement unlocked",
      message: "You've completed 5 lectures in a row!",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      title: "Friend request",
      message: "Jane Smith wants to connect with you",
      time: "2 days ago",
      read: true,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button className="text-sm text-blue-600 hover:text-blue-800">Mark all as read</button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex items-start hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50/30" : ""}`}
              >
                <div
                  className={`p-2 rounded-full ${!notification.read ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"} mr-3`}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className={`font-medium ${!notification.read ? "text-blue-900" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full mb-4">
              <Bell className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}

