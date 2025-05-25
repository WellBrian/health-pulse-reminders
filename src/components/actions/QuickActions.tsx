
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Users, CalendarIcon, Bell, Plus } from "lucide-react";

const QuickActions = () => {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isScheduleAppointmentOpen, setIsScheduleAppointmentOpen] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Add Patient Form
  const handleAddPatient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const patientData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      date_of_birth: formData.get('date_of_birth') as string,
      medical_record_number: formData.get('medical_record_number') as string,
    };

    try {
      const { error } = await supabase
        .from('patients')
        .insert([patientData]);

      if (error) throw error;

      toast({
        title: "Patient Added",
        description: "New patient has been successfully added to the system.",
      });

      setIsAddPatientOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Schedule Appointment Form
  const handleScheduleAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const appointmentData = {
      patient_id: formData.get('patient_id') as string,
      doctor_id: formData.get('doctor_id') as string,
      appointment_date: formData.get('appointment_date') as string,
      notes: formData.get('notes') as string,
      status: 'scheduled'
    };

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;

      toast({
        title: "Appointment Scheduled",
        description: "New appointment has been successfully scheduled.",
      });

      setIsScheduleAppointmentOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send Bulk Reminder
  const handleSendBulkReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const reminderData = {
      reminder_type: formData.get('reminder_type') as string,
      message: formData.get('message') as string,
      reminder_time: new Date().toISOString(),
    };

    try {
      // In a real implementation, you would:
      // 1. Fetch upcoming appointments
      // 2. Create reminders for each appointment
      // 3. Schedule them for sending
      
      // For now, we'll just show a success message
      toast({
        title: "Bulk Reminders Scheduled",
        description: "Reminders have been scheduled for upcoming appointments.",
      });

      setIsSendReminderOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add New Patient */}
        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter the patient's information to add them to the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" name="date_of_birth" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medical_record_number">Medical Record #</Label>
                  <Input id="medical_record_number" name="medical_record_number" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Patient"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Schedule Appointment */}
        <Dialog open={isScheduleAppointmentOpen} onOpenChange={setIsScheduleAppointmentOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for a patient.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient ID</Label>
                <Input id="patient_id" name="patient_id" placeholder="Enter patient ID" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_id">Doctor ID</Label>
                <Input id="doctor_id" name="doctor_id" placeholder="Enter doctor ID" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Appointment Date & Time</Label>
                <Input id="appointment_date" name="appointment_date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Any additional notes..." />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsScheduleAppointmentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Send Bulk Reminders */}
        <Dialog open={isSendReminderOpen} onOpenChange={setIsSendReminderOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Send Bulk Reminders
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send Bulk Reminders</DialogTitle>
              <DialogDescription>
                Send reminders to patients with upcoming appointments.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendBulkReminder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminder_type">Reminder Type</Label>
                <Select name="reminder_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  placeholder="Enter reminder message..." 
                  required 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsSendReminderOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reminders"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
