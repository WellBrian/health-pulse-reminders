import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarIcon, Bell, ArrowRight, Calendar as CalendarPickerIcon } from "lucide-react";
import { format } from "date-fns";
import QuickActions from "@/components/actions/QuickActions";
import SystemStatus from "@/components/system/SystemStatus";

interface DashboardOverviewProps {
  onViewCalendar: () => void;
  onViewReminders: () => void;
}

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  notes?: string;
  patients: { name: string } | null;
  doctors: { name: string } | null;
}

interface Reminder {
  id: string;
  reminder_type: string;
  status: string;
  created_at: string;
  delivery_status?: string;
  appointments: {
    patients: { name: string } | null;
  } | null;
}

const DashboardOverview = ({ onViewCalendar, onViewReminders }: DashboardOverviewProps) => {
  const { theme, themes } = useTheme();
  const { user } = useAuth();
  const currentTheme = themes[theme];
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchAppointments = async (date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          notes,
          patients!fk_appointments_patient_id(name),
          doctors!fk_appointments_doctor_id(name)
        `)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .order('appointment_date', { ascending: true })
        .limit(4);

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchRecentReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          id,
          reminder_type,
          status,
          created_at,
          delivery_status,
          appointments!fk_reminders_appointment_id(
            patients!fk_appointments_patient_id(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching reminders:', error);
        return;
      }

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAppointments(selectedDate),
        fetchRecentReminders()
      ]);
      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user, selectedDate]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      scheduled: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
      pending: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      reminder_sent: { variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
      delivered: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      failed: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      completed: { variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
      cancelled: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      sent: { variant: "default" as const, color: "bg-green-100 text-green-800" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Appointments with Date Picker */}
      <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-gray-200`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-semibold">
              {isToday(selectedDate) ? "Today's Appointments" : "Appointments"}
            </CardTitle>
            <CardDescription>
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarPickerIcon className="h-4 w-4 mr-2" />
                  {isToday(selectedDate) ? "Today" : format(selectedDate, 'MMM d')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>No appointments scheduled for {isToday(selectedDate) ? "today" : "this date"}</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">
                      {appointment.patients?.name || 'Unknown Patient'}
                    </p>
                    <Badge className={getStatusBadge(appointment.status).color}>
                      {appointment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatTime(appointment.appointment_date)} • Dr. {appointment.doctors?.name || 'TBD'}
                  </p>
                  {appointment.notes && (
                    <p className="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                  )}
                </div>
              </div>
            ))
          )}
          <Button className="w-full mt-4" variant="outline" onClick={onViewCalendar}>
            View Full Calendar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reminder Activity */}
      <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-gray-200`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-semibold">Recent Reminders</CardTitle>
            <CardDescription>Latest reminder activity</CardDescription>
          </div>
          <Bell className="h-6 w-6 text-purple-600" />
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>No recent reminder activity</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">
                      {reminder.appointments?.patients?.name || 'Unknown Patient'}
                    </p>
                    <Badge className={getStatusBadge(reminder.delivery_status || reminder.status).color}>
                      {reminder.delivery_status || reminder.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {reminder.reminder_type.toUpperCase()} • {getTimeAgo(reminder.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <Button className="w-full mt-4" variant="outline" onClick={onViewReminders}>
            View All Reminders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions />

      {/* System Status */}
      <SystemStatus />
    </div>
  );
};

export default DashboardOverview;
