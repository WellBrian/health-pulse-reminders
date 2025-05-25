
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, ArrowLeft, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Reminder {
  id: string;
  reminder_type: string;
  message: string;
  reminder_time: string;
  status: string;
  sent_at?: string;
  delivery_status?: string;
  appointment: {
    patient_name: string;
    doctor_name: string;
    appointment_date: string;
  };
}

interface RemindersViewProps {
  onBack: () => void;
}

const RemindersView = ({ onBack }: RemindersViewProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();

  const fetchReminders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          appointments(
            patients(name),
            doctors(name),
            appointment_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReminders = data?.map(reminder => ({
        id: reminder.id,
        reminder_type: reminder.reminder_type,
        message: reminder.message,
        reminder_time: reminder.reminder_time,
        status: reminder.status,
        sent_at: reminder.sent_at,
        delivery_status: reminder.delivery_status,
        appointment: {
          patient_name: reminder.appointments?.patients?.name || 'Unknown Patient',
          doctor_name: reminder.appointments?.doctors?.name || 'Unknown Doctor',
          appointment_date: reminder.appointments?.appointment_date || ''
        }
      })) || [];

      setReminders(formattedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const getStatusIcon = (status: string, deliveryStatus?: string) => {
    if (status === 'sent' && deliveryStatus === 'delivered') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (status === 'sent' && deliveryStatus === 'failed') {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else if (status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    return <Bell className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadge = (status: string, deliveryStatus?: string) => {
    if (status === 'sent' && deliveryStatus === 'delivered') {
      return { color: "bg-green-100 text-green-800", text: "Delivered" };
    } else if (status === 'sent' && deliveryStatus === 'failed') {
      return { color: "bg-red-100 text-red-800", text: "Failed" };
    } else if (status === 'pending') {
      return { color: "bg-yellow-100 text-yellow-800", text: "Pending" };
    }
    return { color: "bg-gray-100 text-gray-800", text: status };
  };

  const filterReminders = (filter: string) => {
    switch (filter) {
      case 'pending':
        return reminders.filter(r => r.status === 'pending');
      case 'sent':
        return reminders.filter(r => r.status === 'sent');
      case 'failed':
        return reminders.filter(r => r.delivery_status === 'failed');
      default:
        return reminders;
    }
  };

  const getStats = () => {
    const total = reminders.length;
    const pending = reminders.filter(r => r.status === 'pending').length;
    const sent = reminders.filter(r => r.status === 'sent').length;
    const failed = reminders.filter(r => r.delivery_status === 'failed').length;
    
    return { total, pending, sent, failed };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">All Reminders</h2>
          <p className="text-gray-600">Manage and track all reminder activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Reminders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder History</CardTitle>
          <CardDescription>All reminder activities and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading reminders...</p>
                </div>
              ) : filterReminders(activeTab).length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">No reminders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filterReminders(activeTab).map((reminder) => {
                    const badge = getStatusBadge(reminder.status, reminder.delivery_status);
                    return (
                      <div key={reminder.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            {getStatusIcon(reminder.status, reminder.delivery_status)}
                            <div>
                              <h4 className="font-semibold text-gray-900">{reminder.appointment.patient_name}</h4>
                              <p className="text-sm text-gray-600">Dr. {reminder.appointment.doctor_name}</p>
                            </div>
                          </div>
                          <Badge className={badge.color}>{badge.text}</Badge>
                        </div>
                        
                        <div className="ml-7">
                          <p className="text-sm text-gray-700 mb-2">{reminder.message}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <p>Type: {reminder.reminder_type.toUpperCase()}</p>
                            <p>Scheduled: {format(new Date(reminder.reminder_time), 'MMM d, h:mm a')}</p>
                            {reminder.sent_at && (
                              <p>Sent: {format(new Date(reminder.sent_at), 'MMM d, h:mm a')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RemindersView;
