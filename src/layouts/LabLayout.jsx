import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, LayoutDashboard, CalendarClock, Beaker, Bell, Search, CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useLabData } from '../contexts/LabDataContext'
import logo from '../assets/techlink-logo.svg'

const tabs = [
  { to: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lab/queue', label: 'Lab Queue', icon: Beaker },
  { to: '/lab/schedule', label: 'Schedule', icon: CalendarClock },
]

function LabLayout() {
  const navigate = useNavigate()
  const { labRequests, schedule } = useLabData()
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef(null)

  // Generate notifications from lab requests and schedule
  const notifications = [
    ...labRequests
      .filter(r => r.status === 'Pending')
      .slice(0, 3)
      .map((req) => ({
        id: `pending-${req.id}`,
        type: 'warning',
        title: 'Pending Request',
        message: `${req.id} - ${req.productName} (${req.service}) needs attention`,
        time: 'Recently',
        read: false,
        link: `/lab/queue/${req.id}`,
      })),
    ...labRequests
      .filter(r => r.status === 'Completed' && r.completedAt)
      .slice(0, 2)
      .map((req) => ({
        id: `completed-${req.id}`,
        type: 'success',
        title: 'Request Completed',
        message: `${req.id} - ${req.productName} testing completed successfully`,
        time: 'Recently',
        read: false,
        link: `/lab/queue/${req.id}`,
      })),
    ...labRequests
      .filter(r => r.status === 'Rejected')
      .slice(0, 1)
      .map((req) => ({
        id: `rejected-${req.id}`,
        type: 'warning',
        title: 'Request Rejected',
        message: `${req.id} - ${req.productName} was rejected`,
        time: 'Recently',
        read: false,
        link: `/lab/queue/${req.id}`,
      })),
    ...schedule
      .filter(s => {
        const startTime = new Date(s.startTime)
        const now = new Date()
        const hoursUntilStart = (startTime - now) / (1000 * 60 * 60)
        return hoursUntilStart > 0 && hoursUntilStart <= 24 && s.status === 'Scheduled'
      })
      .slice(0, 2)
      .map((sched) => ({
        id: `schedule-${sched.id}`,
        type: 'info',
        title: 'Upcoming Schedule',
        message: `${sched.service} - ${sched.productName} scheduled soon`,
        time: 'Today',
        read: false,
        link: `/lab/schedule?request=${sched.requestId}`,
      })),
  ].slice(0, 5)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification) => {
    setNotificationsOpen(false)
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Find matching request
      const matchingRequest = labRequests.find(r =>
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      if (matchingRequest) {
        navigate(`/lab/queue/${matchingRequest.id}`)
      } else {
        // Navigate to queue with search term
        navigate(`/lab/queue?search=${encodeURIComponent(searchTerm)}`)
      }
      setSearchTerm('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-3">
            <motion.img
            src={logo}
            alt="Techlink Logo"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="h-16 w-auto flex-shrink-0"
            />
          </NavLink>
          <div className="hidden md:flex items-center gap-3 w-1/2">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID or product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </form>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-primary font-medium">{unreadCount} new</span>
                      )}
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 p-1.5 rounded-lg ${
                                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
                                {notification.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                                {notification.type === 'info' && <Info className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false)
                            navigate('/lab/queue')
                          }}
                          className="w-full text-sm text-primary hover:text-primary-dark font-medium"
                        >
                          View All Notifications →
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-sm">
                AS
              </div>
              <span className="text-sm font-medium text-gray-700">Aditya Sahu</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-6">
            {tabs.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 py-3 border-b-2 ${
                    isActive ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-6 py-6">
        <Outlet />
      </motion.main>

      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-4 flex justify-end gap-6 text-sm text-gray-500">
          <a href="#">Documentation</a>
          <a href="#">Lab SOP</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </div>
  )
}

export default LabLayout


