
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Bell, ArrowRight } from "lucide-react";

const DashboardOverview = () => {
  const upcomingAppointments = [
    { id: 1, patient: "Sarah Johnson", time: "09:00 AM", type: "Consultation", status: "confirmed" },
    { id: 2, patient: "Michael Chen", time: "10:30 AM", type: "Follow-up", status: "pending" },
    { id: 3, patient: "Emily Davis", time: "02:15 PM", type: "Check-up", status: "confirmed" },
    { id: 4, patient: "Robert Wilson", time: "04:00 PM", type: "Consultation", status: "reminder_sent" },
  ];

  const recentReminders = [
    { id: 1, patient: "Alice Brown", type: "SMS", status: "delivered", time: "2 hours ago" },
    { id: 2, patient: "John Smith", type: "WhatsApp", status: "delivered", time: "3 hours ago" },
    { id: 3, patient: "Maria Garcia", type: "Email", status: "pending", time: "5 hours ago" },
    { id: 4, patient: "David Lee", type: "SMS", status: "failed", time: "6 hours ago" },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      pending: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      reminder_sent: { variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
      delivered: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      failed: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Today's Appointments */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-semibold">Today's Appointments</CardTitle>
            <CardDescription>Manage your schedule for today</CardDescription>
          </div>
          <Calendar className="h-6 w-6 text-blue-600" />
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">{appointment.patient}</p>
                  <Badge className={getStatusBadge(appointment.status).color}>
                    {appointment.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{appointment.time} • {appointment.type}</p>
              </div>
            </div>
          ))}
          <Button className="w-full mt-4" variant="outline">
            View Full Calendar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reminder Activity */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-semibold">Recent Reminders</CardTitle>
            <CardDescription>Latest reminder activity</CardDescription>
          </div>
          <Bell className="h-6 w-6 text-purple-600" />
        </CardHeader>
        <CardContent className="space-y-4">
          {recentReminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">{reminder.patient}</p>
                  <Badge className={getStatusBadge(reminder.status).color}>
                    {reminder.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{reminder.type} • {reminder.time}</p>
              </div>
            </div>
          ))}
          <Button className="w-full mt-4" variant="outline">
            View All Reminders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Send Bulk Reminders
          </Button>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">System Status</CardTitle>
          <CardDescription>Service health and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SMS Service</span>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">WhatsApp API</span>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email Service</span>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm text-yellow-600">Degraded</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Database</span>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
