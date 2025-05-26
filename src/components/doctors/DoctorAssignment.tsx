
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Clock, Calendar, Users, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
}

interface Patient {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  patients: { name: string } | null;
  doctors: { name: string } | null;
}

const DoctorAssignment = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [unassignedAppointments, setUnassignedAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch doctors with email for notifications
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('id, name, email, specialization')
        .order('name');

      // Fetch unassigned appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          patients!fk_appointments_patient_id(name),
          doctors!fk_appointments_doctor_id(name)
        `)
        .is('doctor_id', null)
        .eq('status', 'scheduled')
        .order('appointment_date');

      setDoctors(doctorsData || []);
      setUnassignedAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    }
  };

  const sendNotificationToDoctor = async (doctorEmail: string, doctorName: string, patientName: string, appointmentDate: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-doctor-notification', {
        body: {
          doctorEmail,
          doctorName,
          patientName,
          appointmentDate: new Date(appointmentDate).toLocaleString()
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const assignDoctor = async (appointmentId: string, doctorId: string, showSuccessToast = true) => {
    try {
      // Get appointment details for notification
      const appointment = unassignedAppointments.find(apt => apt.id === appointmentId);
      const doctor = doctors.find(doc => doc.id === doctorId);

      if (!appointment || !doctor) {
        throw new Error('Appointment or doctor not found');
      }

      const { error } = await supabase
        .from('appointments')
        .update({ 
          doctor_id: doctorId, 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error assigning doctor:', error);
        throw error;
      }

      // Send notification to doctor
      await sendNotificationToDoctor(
        doctor.email,
        doctor.name,
        appointment.patients?.name || 'Unknown Patient',
        appointment.appointment_date
      );

      if (showSuccessToast) {
        toast({
          title: "Success",
          description: `Dr. ${doctor.name} assigned and notified successfully`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      if (showSuccessToast) {
        toast({
          title: "Error",
          description: "Failed to assign doctor",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const assignRandomDoctor = async (appointmentId: string) => {
    if (doctors.length === 0) {
      toast({
        title: "Error",
        description: "No doctors available for assignment",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
    const success = await assignDoctor(appointmentId, randomDoctor.id);
    
    if (success) {
      await fetchData(); // Refresh data
    }
    setLoading(false);
  };

  const bulkRandomAssignment = async () => {
    if (doctors.length === 0 || unassignedAppointments.length === 0) {
      toast({
        title: "Error",
        description: "No doctors or appointments available for bulk assignment",
        variant: "destructive"
      });
      return;
    }

    setBulkAssignLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const appointment of unassignedAppointments) {
        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        const success = await assignDoctor(appointment.id, randomDoctor.id, false);
        
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast({
        title: "Bulk Assignment Complete",
        description: `Successfully assigned ${successCount} appointments. ${failCount > 0 ? `${failCount} failed.` : ''}`,
      });

      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast({
        title: "Error",
        description: "Bulk assignment encountered errors",
        variant: "destructive"
      });
    } finally {
      setBulkAssignLoading(false);
    }
  };

  const handleManualAssignment = async () => {
    if (!selectedDoctor || !selectedAppointment) {
      toast({
        title: "Error",
        description: "Please select both a doctor and an appointment",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const success = await assignDoctor(selectedAppointment, selectedDoctor);
    
    if (success) {
      setSelectedDoctor("");
      setSelectedAppointment("");
      await fetchData(); // Refresh data
    }
    setLoading(false);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Doctor Assignment</h3>
          <p className="text-gray-600">Assign doctors to unassigned appointments</p>
        </div>
        <Button 
          onClick={bulkRandomAssignment}
          disabled={bulkAssignLoading || loading || doctors.length === 0 || unassignedAppointments.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Users className="mr-2 h-4 w-4" />
          {bulkAssignLoading ? "Assigning..." : "Assign All Randomly"}
        </Button>
      </div>

      {/* Manual Assignment */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5 text-blue-600" />
            Manual Assignment
          </CardTitle>
          <CardDescription>Manually assign a doctor to a specific appointment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Doctor</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} {doctor.specialization && `(${doctor.specialization})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Appointment</label>
              <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an appointment" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedAppointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {appointment.patients?.name} - {formatDateTime(appointment.appointment_date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleManualAssignment}
                disabled={loading || !selectedDoctor || !selectedAppointment}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                {loading ? "Assigning..." : "Assign Doctor"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Appointments List */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-orange-600" />
            Unassigned Appointments ({unassignedAppointments.length})
          </CardTitle>
          <CardDescription>Appointments waiting for doctor assignment</CardDescription>
        </CardHeader>
        <CardContent>
          {unassignedAppointments.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <UserCheck className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>All appointments have been assigned to doctors</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unassignedAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {appointment.patients?.name || 'Unknown Patient'}
                      </h4>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        Unassigned
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDateTime(appointment.appointment_date)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => assignRandomDoctor(appointment.id)}
                    disabled={loading || bulkAssignLoading || doctors.length === 0}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Random Doctor
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Doctors */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-green-600" />
            Available Doctors ({doctors.length})
          </CardTitle>
          <CardDescription>Doctors available for appointment assignment</CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>No doctors available. Please add doctors first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                  <p className="text-sm text-gray-600">{doctor.email}</p>
                  {doctor.specialization && (
                    <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700">
                      {doctor.specialization}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAssignment;
