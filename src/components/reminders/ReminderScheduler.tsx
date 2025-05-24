
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, Users, Send, Clock, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ReminderScheduler = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [scheduleType, setScheduleType] = useState("immediate");

  const reminderTemplates = [
    {
      id: "appointment-24h",
      name: "24 Hour Appointment Reminder",
      message: "Hi {patientName}, this is a reminder that you have an appointment with Dr. {doctorName} tomorrow at {appointmentTime}. Please reply CONFIRM to confirm or call {clinicPhone} to reschedule.",
      type: "appointment"
    },
    {
      id: "appointment-2h",
      name: "2 Hour Appointment Reminder",
      message: "Hi {patientName}, your appointment with Dr. {doctorName} is in 2 hours at {appointmentTime}. Location: {clinicAddress}. Please arrive 15 minutes early.",
      type: "appointment"
    },
    {
      id: "follow-up",
      name: "Follow-up Care Reminder",
      message: "Hello {patientName}, it's time for your follow-up appointment. Please call {clinicPhone} to schedule your next visit with Dr. {doctorName}.",
      type: "follow-up"
    },
    {
      id: "medication",
      name: "Medication Reminder",
      message: "Hi {patientName}, this is a reminder to take your {medicationName} as prescribed. If you have any questions, please contact our office at {clinicPhone}.",
      type: "medication"
    }
  ];

  const upcomingAppointments = [
    { id: 1, patient: "Sarah Johnson", doctor: "Dr. Smith", time: "2024-01-25 10:00", phone: "+1-555-123-4567", reminderSent: false },
    { id: 2, patient: "Michael Chen", doctor: "Dr. Brown", time: "2024-01-25 14:30", phone: "+1-555-234-5678", reminderSent: true },
    { id: 3, patient: "Emily Davis", doctor: "Dr. Wilson", time: "2024-01-26 09:15", phone: "+1-555-345-6789", reminderSent: false },
    { id: 4, patient: "Robert Wilson", doctor: "Dr. Smith", time: "2024-01-26 16:00", phone: "+1-555-456-7890", reminderSent: false },
  ];

  const handleSendReminder = (appointmentId?: number) => {
    if (appointmentId) {
      toast({
        title: "Reminder Sent",
        description: `Individual reminder sent successfully`,
      });
    } else {
      toast({
        title: "Bulk Reminders Sent",
        description: `Reminders sent to ${upcomingAppointments.filter(apt => !apt.reminderSent).length} patients`,
      });
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reminder Scheduler</h2>
        <p className="text-gray-600">Set up and manage automated patient reminders</p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm">
          <TabsTrigger value="schedule">Schedule Reminders</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reminder Configuration */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-blue-600" />
                  Configure Reminder
                </CardTitle>
                <CardDescription>Set up your reminder parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder-type">Reminder Type</Label>
                  <Select value={reminderType} onValueChange={setReminderType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reminder type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="all">All Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Message Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="When to send" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="24h">24 Hours Before</SelectItem>
                      <SelectItem value="2h">2 Hours Before</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleType === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" />
                    <Input type="time" />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="auto-reminder" />
                  <Label htmlFor="auto-reminder">Enable automatic reminders</Label>
                </div>
              </CardContent>
            </Card>

            {/* Message Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
                  Message Preview
                </CardTitle>
                <CardDescription>Preview and customize your message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message-preview">Message Content</Label>
                  <Textarea
                    id="message-preview"
                    value={
                      selectedTemplate 
                        ? reminderTemplates.find(t => t.id === selectedTemplate)?.message || ""
                        : customMessage
                    }
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom message or select a template above"
                    rows={6}
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">Available Variables:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                    <span>• {"{patientName}"}</span>
                    <span>• {"{doctorName}"}</span>
                    <span>• {"{appointmentTime}"}</span>
                    <span>• {"{clinicPhone}"}</span>
                    <span>• {"{clinicAddress}"}</span>
                    <span>• {"{medicationName}"}</span>
                  </div>
                </div>

                <Button className="w-full" onClick={() => handleSendReminder()}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Pre-built message templates for different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {reminderTemplates.map((template) => (
                  <Card key={template.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {template.type}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          Use Template
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{template.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
              <p className="text-sm text-gray-600">Manage reminders for scheduled appointments</p>
            </div>
            <Button onClick={() => handleSendReminder()}>
              <Send className="mr-2 h-4 w-4" />
              Send Bulk Reminders
            </Button>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                        {appointment.reminderSent && (
                          <Badge className="bg-green-100 text-green-800">
                            Reminder Sent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {appointment.doctor} • {formatDateTime(appointment.time)}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={appointment.reminderSent}
                        onClick={() => handleSendReminder(appointment.id)}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        {appointment.reminderSent ? "Sent" : "Send Reminder"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReminderScheduler;
