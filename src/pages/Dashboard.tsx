
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import PatientManagement from "@/components/patients/PatientManagement";
import DoctorManagement from "@/components/doctors/DoctorManagement";
import ReminderScheduler from "@/components/reminders/ReminderScheduler";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import FeedbackManagement from "@/components/feedback/FeedbackManagement";
import AttendanceTracking from "@/components/attendance/AttendanceTracking";
import CalendarView from "@/components/calendar/CalendarView";
import RemindersView from "@/components/reminders/RemindersView";
import ThemeSelector from "@/components/theme/ThemeSelector";
import DynamicMetrics from "@/components/dashboard/DynamicMetrics";
import { CalendarIcon, Users, Bell, BarChart3, Palette, LogOut, UserCheck, MessageSquare, CheckCircle, Stethoscope } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'reminders'>('dashboard');
  const { theme, themes } = useTheme();
  const { signOut, user } = useAuth();
  const currentTheme = themes[theme];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewCalendar = () => {
    setCurrentView('calendar');
  };

  const handleViewReminders = () => {
    setCurrentView('reminders');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Show specific views when requested
  if (currentView === 'calendar') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.colors.primary}`}>
        <div className="container mx-auto p-6 max-w-7xl">
          <CalendarView onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  if (currentView === 'reminders') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.colors.primary}`}>
        <div className="container mx-auto p-6 max-w-7xl">
          <RemindersView onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.colors.primary}`}>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">HealthPulse</h1>
              <p className="text-lg text-gray-600">Smart Healthcare Reminder System</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="text-sm text-gray-600">
                Welcome, {user?.email}
              </div>
              
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="relative"
              >
                <Palette className="h-4 w-4" />
              </Button>
              
              {/* Sign Out */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
              
              {/* System Status */}
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Active</span>
              </div>
            </div>
          </div>

          {/* Theme Selector Dropdown */}
          {showThemeSelector && (
            <div className="absolute right-6 top-24 z-50 w-96">
              <ThemeSelector />
            </div>
          )}
          
          {/* Dynamic Quick Stats */}
          <DynamicMetrics />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-7 ${currentTheme.colors.background} backdrop-blur-sm`}>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Patients</span>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Reminders</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview 
              onViewCalendar={handleViewCalendar}
              onViewReminders={handleViewReminders}
            />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <DoctorManagement />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <ReminderScheduler />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackManagement />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceTracking />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
