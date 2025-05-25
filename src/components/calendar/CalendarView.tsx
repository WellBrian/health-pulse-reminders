
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarIcon, Clock, Users, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  notes?: string;
  patient: {
    name: string;
    phone: string;
  };
  doctor: {
    name: string;
    specialization: string;
  };
}

interface CalendarViewProps {
  onBack: () => void;
}

const CalendarView = ({ onBack }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAppointments = async (date: Date) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(name, phone),
          doctors(name, specialization)
        `)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      const formattedAppointments = data?.map(apt => ({
        id: apt.id,
        appointment_date: apt.appointment_date,
        status: apt.status,
        notes: apt.notes,
        patient: {
          name: apt.patients?.name || 'Unknown Patient',
          phone: apt.patients?.phone || 'No phone'
        },
        doctor: {
          name: apt.doctors?.name || 'Unknown Doctor',
          specialization: apt.doctors?.specialization || 'General'
        }
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate, user]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      confirmed: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      completed: { variant: "default" as const, color: "bg-gray-100 text-gray-800" },
      cancelled: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Calendar View</h2>
          <p className="text-gray-600">View and manage appointments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Select Date
            </CardTitle>
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

        {/* Appointments for selected date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Appointments for {format(selectedDate, 'MMMM d, yyyy')}
              </div>
              <Badge variant="outline">{appointments.length} appointments</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No appointments scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.patient.name}</h4>
                        <p className="text-sm text-gray-600">Dr. {appointment.doctor.name} • {appointment.doctor.specialization}</p>
                      </div>
                      <Badge className={getStatusBadge(appointment.status).color}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p><Clock className="inline h-4 w-4 mr-1" />{format(new Date(appointment.appointment_date), 'h:mm a')}</p>
                      <p>📞 {appointment.patient.phone}</p>
                    </div>
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                        Note: {appointment.notes}
                      </p>
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

export default CalendarView;
