import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, Clock, Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AttendedAppointment {
  id: string;
  appointment_date: string;
  attendance_status: string;
  checked_in_at: string;
  completed_at: string;
  patients: { name: string; phone: string } | null;
  doctors: { name: string; specialization: string } | null;
}

const AttendanceTracking = () => {
  const [appointments, setAppointments] = useState<AttendedAppointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttended: 0,
    totalScheduled: 0,
    attendanceRate: 0,
    completedToday: 0
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendedAppointments();
    fetchAttendanceStats();
  }, [user, selectedDate]);

  const fetchAttendedAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!fk_appointments_patient_id(name, phone),
          doctors!fk_appointments_doctor_id(name, specialization)
        `)
        .in('attendance_status', ['checked_in', 'completed'])
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching attended appointments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance data",
          variant: "destructive"
        });
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    if (!user) return;
    
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Get today's completed appointments
      const { data: completedToday, error: completedError } = await supabase
        .from('appointments')
        .select('id')
        .eq('attendance_status', 'completed')
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString());

      // Get total attended appointments
      const { data: totalAttended, error: attendedError } = await supabase
        .from('appointments')
        .select('id')
        .in('attendance_status', ['checked_in', 'completed']);

      // Get total scheduled appointments
      const { data: totalScheduled, error: scheduledError } = await supabase
        .from('appointments')
        .select('id');

      if (completedError || attendedError || scheduledError) {
        console.error('Error fetching stats:', { completedError, attendedError, scheduledError });
        return;
      }

      const attendedCount = totalAttended?.length || 0;
      const scheduledCount = totalScheduled?.length || 0;
      const attendanceRate = scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

      setStats({
        totalAttended: attendedCount,
        totalScheduled: scheduledCount,
        attendanceRate,
        completedToday: completedToday?.length || 0
      });
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const markAsCompleted = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          attendance_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment:', error);
        toast({
          title: "Error",
          description: "Failed to mark appointment as completed",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Appointment marked as completed",
      });

      fetchAttendedAppointments();
      fetchAttendanceStats();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctors?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: "bg-green-100 text-green-800", label: "Completed" };
      case 'checked_in':
        return { color: "bg-blue-100 text-blue-800", label: "Checked In" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Attendance Tracking</h2>
        <p className="text-gray-600">Monitor patient attendance and completed appointments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Attended</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAttended}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <CheckCircle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalScheduled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Attended Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attended Appointments - {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
            <CardDescription>Patients who attended their appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by patient or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading attendance data...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No attended appointments for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.patients?.name}</h4>
                        <p className="text-sm text-gray-600">Dr. {appointment.doctors?.name} • {appointment.doctors?.specialization}</p>
                      </div>
                      <Badge className={getStatusBadge(appointment.attendance_status).color}>
                        {getStatusBadge(appointment.attendance_status).label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <p><Clock className="inline h-4 w-4 mr-1" />{format(new Date(appointment.appointment_date), 'h:mm a')}</p>
                      <p>📞 {appointment.patients?.phone}</p>
                      {appointment.checked_in_at && (
                        <p>✅ Checked in: {format(new Date(appointment.checked_in_at), 'h:mm a')}</p>
                      )}
                      {appointment.completed_at && (
                        <p>🏁 Completed: {format(new Date(appointment.completed_at), 'h:mm a')}</p>
                      )}
                    </div>
                    {appointment.attendance_status === 'checked_in' && (
                      <Button 
                        size="sm" 
                        onClick={() => markAsCompleted(appointment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceTracking;
