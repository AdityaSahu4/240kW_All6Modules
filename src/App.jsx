import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { RoleProvider } from './contexts/RoleContext'
import { DataProvider } from './contexts/DataContext'
import { LabDataProvider } from './contexts/LabDataContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Pricing from './pages/Pricing'
import Blog from './pages/Blog'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ProductDetails from './pages/ProductDetails'
import DashboardLayout from './layouts/DashboardLayout'
import CustomerDashboard from './pages/customer/Dashboard'
import Documents from './pages/customer/Documents'
import OrderHistory from './pages/customer/OrderHistory'
import Profile from './pages/customer/Profile'
import Products from './pages/customer/Products'
import ProductDetail from './pages/customer/ProductDetail'
import OrderDetail from './pages/customer/OrderDetail'
import Messages from './pages/customer/Messages'
import Settings from './pages/customer/Settings'
import ServiceSelection from './pages/ServiceSelection'
import LabLayout from './layouts/LabLayout'
import LabLogin from './pages/lab/Login'
import LabSignupPersonal from './pages/lab/SignupPersonal'
import LabSignupDocuments from './pages/lab/SignupDocuments'
import LabDashboard from './pages/lab/Dashboard'
import LabQueue from './pages/lab/Queue'
import LabSchedule from './pages/lab/Schedule'
import RequestDetail from './pages/lab/RequestDetail'
import PortalSelection from './pages/lab/PortalSelection'
import TestingSubmissionSuccess from './pages/services/Testing/SubmissionSuccess'
import SimulationSubmissionSuccess from './pages/services/Simulation/SimulationSubmissionSuccess'

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

import Design from './pages/services/Design'
import DesignFlow from './pages/services/Design V&V/DesignFlow'
import DesignSubmissionSuccess from './pages/services/Design V&V/DesignSubmissionSuccess'
import Testing from './pages/services/Testing'
import Calibration from './pages/services/Calibration'
import CalibrationFlow from './pages/services//Calibration/CalibrationFlow'
import Simulation from './pages/services/Simulation'
import SimulationFlow from './pages/services/Simulation/SimulationFlow'
import Debugging from './pages/services/Debugging'
import DebuggingFlow from './pages/services/Debugging/DebuggingFlow'
import Certification from './pages/services/Certification'
import CertificationFlow from './pages/services/Certification/CertificationFlow'
import TestingFlow from './pages/services/Testing/TestingFlow'

// ScrollToTop component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function AnimatedRoutes() {
  const location = useLocation()

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/services"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Services />
            </motion.div>
          }
        />
        <Route
          path="/pricing"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Pricing />
            </motion.div>
          }
        />
        <Route
          path="/blog"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Blog />
            </motion.div>
          }
        />
        <Route
          path="/about"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <About />
            </motion.div>
          }
        />
        <Route
          path="/contact"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Contact />
            </motion.div>
          }
        />
        <Route
          path="/login"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Login />
            </motion.div>
          }
        />
        <Route
          path="/signup"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <SignUp />
            </motion.div>
          }
        />
        <Route
          path="/product-details"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ProductDetails />
            </motion.div>
          }
        />
        <Route
          path="/services/select"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ServiceSelection />
            </motion.div>
          }
        />
        {/* Service Detail Pages */}
        <Route
          path="/services/design"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Design />
            </motion.div>
          }
        />
        <Route
          path="/services/design/start"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <DesignFlow />
            </motion.div>
          }
        />
        <Route
          path="/services/design/:step?"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <DesignFlow />
            </motion.div>
          }
        />
        <Route
          path="/services/design/submission-success"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <DesignSubmissionSuccess />
            </motion.div>
          }
        />
        <Route
          path="/services/testing"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Testing />
            </motion.div>
          }
        />
        <Route
          path="/services/testing/:step?"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <TestingFlow />
            </motion.div>
          }
        />
        <Route
          path="/services/testing/submission-success"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <TestingSubmissionSuccess />
            </motion.div>
          }
        />
        <Route
          path="/services/calibration"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Calibration />
            </motion.div>
          }
        />
        <Route
          path="/services/calibration/start"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <CalibrationFlow />
            </motion.div>
          }
        />
        <Route
          path="/services/simulation"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Simulation />
            </motion.div>
          }
        />
        <Route
          path="/services/simulation/:step?"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <SimulationFlow />
            </motion.div>
          }
        />
        <Route
          path="/services/simulation/submission-success"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
          >
              <SimulationSubmissionSuccess />
            </motion.div>
          }
        />
        <Route
          path="/services/product-debugging"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Debugging />
            </motion.div>
          }
        />
        <Route
          path="/services/product-debugging/start"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <DebuggingFlow />
            </motion.div>
          }
        />
        <Route
          path="/services/certification"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Certification />
            </motion.div>
          }
        />
        <Route
          path="/services/certification/start"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <CertificationFlow />
            </motion.div>
          }
        />
        {/* Customer Area */}
        <Route path="/customer" element={<DashboardLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="order-history/:id" element={<OrderDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        {/* Lab Area (portal + simple lab dashboard) */}
        <Route path="/lab/portal" element={<PortalSelection />} />
        <Route path="/lab/login" element={<LabLogin />} />
        <Route path="/lab/signup" element={<LabSignupPersonal />} />
        <Route path="/lab/signup/documents" element={<LabSignupDocuments />} />
        <Route path="/lab" element={<LabLayout />}>
          <Route path="dashboard" element={<LabDashboard />} />
          <Route path="queue" element={<LabQueue />} />
          <Route path="queue/:id" element={<RequestDetail />} />
          <Route path="schedule" element={<LabSchedule />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const location = useLocation()
  const isLabDashboardRoute = location.pathname.startsWith('/lab/dashboard') ||
    location.pathname.startsWith('/lab/queue') ||
    location.pathname.startsWith('/lab/schedule')
  const isLabAuthRoute = location.pathname.startsWith('/lab/login') ||
    location.pathname.startsWith('/lab/signup')
  const isCustomerDashboardRoute = location.pathname.startsWith('/customer/')

  // Hide main header/footer on lab dashboard and customer dashboard (they have their own layouts)
  // But show on lab auth pages and portal selection so users can switch roles
  const showMainHeader = !isLabDashboardRoute && !isCustomerDashboardRoute
  const showMainFooter = !isLabDashboardRoute && !isCustomerDashboardRoute

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {showMainHeader && <Header />}
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      {showMainFooter && <Footer />}
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <RoleProvider>
      <DataProvider>
        <LabDataProvider>
          <Router>
            <AppContent />
          </Router>
        </LabDataProvider>
      </DataProvider>
    </RoleProvider>
  )
}

export default App
