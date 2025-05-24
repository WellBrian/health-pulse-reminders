
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import PatientManagement from "@/components/patients/PatientManagement";
import ReminderScheduler from "@/components/reminders/ReminderScheduler";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { Calendar, Users, Bell, BarChart3, Palette } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

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
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Active</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className={`${currentTheme.colors.background} backdrop-blur-sm ${currentTheme.colors.accent}`}>
              <CardContent className="p-4 flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-green-100`}>
              <CardContent className="p-4 flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-purple-100`}>
              <CardContent className="p-4 flex items-center">
                <Bell className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Reminders Sent</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-orange-100`}>
              <CardContent className="p-4 flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">94%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-5 ${currentTheme.colors.background} backdrop-blur-sm`}>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Patients</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Reminders</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Themes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <ReminderScheduler />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <ThemeSelector />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
