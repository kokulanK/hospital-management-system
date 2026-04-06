// Import the PendingApprovals component (create it first)
import PendingApprovals from './pages/admin/PendingApprovals';

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Doctor pages
import Availability from './pages/doctor/Availability';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorFeedback from './pages/doctor/Feedback';
import DoctorProfile from './pages/doctor/Profile';
import DoctorLabRequests from './pages/doctor/LabRequests';

// Authentication pages
import Login from "./pages/authentication/Login";
import RegisterPatient from "./pages/authentication/RegisterPatient";
import RegisterDoctor from "./pages/authentication/RegisterDoctor";
import RegisterReceptionist from "./pages/authentication/RegisterReceptionist";
import RegisterLabTechnician from "./pages/authentication/RegisterLabTechnician";
import RegisterCleaningStaff from "./pages/authentication/RegisterCleaningStaff";

// Dashboard pages
import DashboardPatient from "./pages/patient/DashboardPatient";
import DashboardDoctor from "./pages/doctor/DashboardDoctor";

// Patient subpages
import Profile from "./pages/patient/Profile";
import Appointments from "./pages/patient/Appointments"; 
import Feedback from "./pages/patient/Feedback";
import AIScanner from "./pages/patient/AIScanner";
import Settings from "./pages/patient/Settings";
import LabReports from './pages/patient/LabReports';

// Public Home page
import Home from "./pages/Home";

// Cleaning Staff imports
import CleaningLayout from './pages/cleaningStaff/DashboardLayout';
import CleaningHome from './pages/cleaningStaff/DashboardCleaningStaff';
import CleaningTasks from './pages/cleaningStaff/Tasks';
import CleaningProfile from './pages/cleaningStaff/Profile';
import CleaningSupplyRequests from './pages/cleaningStaff/SupplyRequests';

// Receptionist imports
import ReceptionistLayout from './pages/receptionist/DashboardLayout';
import ReceptionistHome from './pages/receptionist/DashboardReceptionist';
import ReceptionistAppointments from './pages/receptionist/Appointments';
import ReceptionistAIScanner from './pages/receptionist/AIScanner';
import ReceptionistProfile from './pages/receptionist/Profile';
import ReceptionistCleaningTasks from './pages/receptionist/CleaningTasks';

// Lab Technician pages
import LabLayout from './pages/lab_technician/DashboardLayout';
import LabHome from './pages/lab_technician/DashboardLabTechnician';
import LabRequests from './pages/lab_technician/LabRequests';
import LabProfile from './pages/lab_technician/Profile';

// Admin pages
import AdminLayout from './pages/admin/DashboardLayout';
import AdminHome from './pages/admin/DashboardAdmin';
import AdminUsers from './pages/admin/Users';
import AdminAppointments from './pages/admin/Appointments';
import AdminFeedback from './pages/admin/Feedback';
import AdminProfile from './pages/admin/Profile';
import AdminSupplyRequests from './pages/admin/SupplyRequests';

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const RedirectIfAuth = ({ children }) => {
    if (user?.role) return <Navigate to={`/dashboard/${user.role}`} replace />;
    return children;
  };

  return (
    <Routes>
      {/* Public Home */}
      <Route path="/" element={<Home />} />

      {/* Login */}
      <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />

      {/* Registration */}
      <Route path="/register/patient" element={<RedirectIfAuth><RegisterPatient /></RedirectIfAuth>} />
      <Route path="/register/doctor" element={<RedirectIfAuth><RegisterDoctor /></RedirectIfAuth>} />
      <Route path="/register/receptionist" element={<RedirectIfAuth><RegisterReceptionist /></RedirectIfAuth>} />
      <Route path="/register/labtechnician" element={<RedirectIfAuth><RegisterLabTechnician /></RedirectIfAuth>} />
      <Route path="/register/cleaningstaff" element={<RedirectIfAuth><RegisterCleaningStaff /></RedirectIfAuth>} />

      {/* Patient routes */}
      <Route path="/dashboard/patient" element={<PrivateRoute allowedRoles={['patient']}><DashboardPatient /></PrivateRoute>} />
      <Route path="/dashboard/patient/profile" element={<PrivateRoute allowedRoles={['patient']}><Profile /></PrivateRoute>} />
      <Route path="/dashboard/patient/appointments" element={<PrivateRoute allowedRoles={['patient']}><Appointments /></PrivateRoute>} />
      <Route path="/dashboard/patient/feedback" element={<PrivateRoute allowedRoles={['patient']}><Feedback /></PrivateRoute>} />
      <Route path="/dashboard/patient/ai-scanner" element={<PrivateRoute allowedRoles={['patient']}><AIScanner /></PrivateRoute>} />
      <Route path="/dashboard/patient/settings" element={<PrivateRoute allowedRoles={['patient']}><Settings /></PrivateRoute>} />
      <Route path="/dashboard/patient/book" element={<Navigate to="/dashboard/patient/appointments" replace />} />
      <Route path="/dashboard/patient/lab-reports" element={<PrivateRoute allowedRoles={['patient']}><LabReports /></PrivateRoute>} />

      {/* Doctor routes */}
      <Route path="/dashboard/doctor" element={<PrivateRoute allowedRoles={["doctor"]}><DashboardDoctor /></PrivateRoute>} />
      <Route path="/dashboard/doctor/availability" element={<PrivateRoute allowedRoles={["doctor"]}><Availability /></PrivateRoute>} />
      <Route path="/dashboard/doctor/appointments" element={<PrivateRoute allowedRoles={["doctor"]}><DoctorAppointments /></PrivateRoute>} />
      <Route path="/dashboard/doctor/feedback" element={<PrivateRoute allowedRoles={["doctor"]}><DoctorFeedback /></PrivateRoute>} />
      <Route path="/dashboard/doctor/profile" element={<PrivateRoute allowedRoles={["doctor"]}><DoctorProfile /></PrivateRoute>} />
      <Route path="/dashboard/doctor/lab-requests" element={<PrivateRoute allowedRoles={['doctor']}><DoctorLabRequests /></PrivateRoute>} />

      {/* Receptionist Routes */}
      <Route path="/dashboard/receptionist" element={<PrivateRoute allowedRoles={['receptionist']}><ReceptionistLayout activePage="home"><ReceptionistHome /></ReceptionistLayout></PrivateRoute>} />
      <Route path="/dashboard/receptionist/appointments" element={<PrivateRoute allowedRoles={['receptionist']}><ReceptionistLayout activePage="appointments"><ReceptionistAppointments /></ReceptionistLayout></PrivateRoute>} />
      <Route path="/dashboard/receptionist/cleaning-tasks" element={<PrivateRoute allowedRoles={['receptionist']}><ReceptionistLayout activePage="cleaning"><ReceptionistCleaningTasks /></ReceptionistLayout></PrivateRoute>} />
      <Route path="/dashboard/receptionist/ai-scanner" element={<PrivateRoute allowedRoles={['receptionist']}><ReceptionistLayout activePage="aiscanner"><ReceptionistAIScanner /></ReceptionistLayout></PrivateRoute>} />
      <Route path="/dashboard/receptionist/profile" element={<PrivateRoute allowedRoles={['receptionist']}><ReceptionistLayout activePage="profile"><ReceptionistProfile /></ReceptionistLayout></PrivateRoute>} />

      {/* Lab Technician routes */}
      <Route path="/dashboard/labtechnician" element={<PrivateRoute allowedRoles={["labTechnician"]}><LabLayout activePage="home"><LabHome /></LabLayout></PrivateRoute>} />
      <Route path="/dashboard/labtechnician/requests" element={<PrivateRoute allowedRoles={["labTechnician"]}><LabLayout activePage="requests"><LabRequests /></LabLayout></PrivateRoute>} />
      <Route path="/dashboard/labtechnician/profile" element={<PrivateRoute allowedRoles={["labTechnician"]}><LabLayout activePage="profile"><LabProfile /></LabLayout></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/dashboard/admin" element={<PrivateRoute allowedRoles={["admin"]}><AdminLayout activePage="home"><AdminHome /></AdminLayout></PrivateRoute>} />
      <Route path="/dashboard/admin/users" element={<PrivateRoute allowedRoles={["admin"]}><AdminLayout activePage="users"><AdminUsers /></AdminLayout></PrivateRoute>} />
      <Route path="/dashboard/admin/pending-approvals" element={<PrivateRoute allowedRoles={["admin"]}><AdminLayout activePage="pending"><PendingApprovals /></AdminLayout></PrivateRoute>} />
      <Route path="/dashboard/admin/appointments" element={<PrivateRoute allowedRoles={["admin"]}><AdminLayout activePage="appointments"><AdminAppointments /></AdminLayout></PrivateRoute>} />
      <Route path="/dashboard/admin/feedback" element={<PrivateRoute allowedRoles={["admin"]}><AdminLayout activePage="feedback"><AdminFeedback /></AdminLayout></PrivateRoute>} />
      <Route path="/dashboard/admin/profile" element={<PrivateRoute allowedRoles={["admin"]}><AdminLayout activePage="profile"><AdminProfile /></AdminLayout></PrivateRoute>} />
      <Route path="/dashboard/admin/supply-requests" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout activePage="supplies"><AdminSupplyRequests /></AdminLayout></PrivateRoute>} />

      {/* Cleaning Staff Routes */}
      <Route path="/dashboard/cleaning" element={<PrivateRoute allowedRoles={['cleaningStaff']}><CleaningLayout activePage="home"><CleaningHome /></CleaningLayout></PrivateRoute>} />
      <Route path="/dashboard/cleaning/tasks" element={<PrivateRoute allowedRoles={['cleaningStaff']}><CleaningLayout activePage="tasks"><CleaningTasks /></CleaningLayout></PrivateRoute>} />
      <Route path="/dashboard/cleaning/profile" element={<PrivateRoute allowedRoles={['cleaningStaff']}><CleaningLayout activePage="profile"><CleaningProfile /></CleaningLayout></PrivateRoute>} />
      <Route path="/dashboard/cleaning/supplies" element={<PrivateRoute allowedRoles={['cleaningStaff']}><CleaningLayout activePage="supplies"><CleaningSupplyRequests /></CleaningLayout></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}