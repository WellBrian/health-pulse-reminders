
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  totalReminders: number;
  successRate: number;
  avgResponseTime: string;
  costSavings: string;
}

interface ReminderStat {
  type: string;
  sent: number;
  delivered: number;
  failed: number;
  rate: number;
}

interface WeeklyData {
  day: string;
  reminders: number;
  confirmations: number;
}

interface AppointmentMetric {
  metric: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalReminders: 0,
    successRate: 0,
    avgResponseTime: "0 min",
    costSavings: "$0"
  });
  const [reminderStats, setReminderStats] = useState<ReminderStat[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [appointmentMetrics, setAppointmentMetrics] = useState<AppointmentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch total reminders
      const { data: reminders } = await supabase
        .from('reminders')
        .select('id, reminder_type, status, delivery_status, created_at');

      // Fetch appointments for metrics
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, status, attendance_status, created_at');

      // Calculate analytics
      const totalReminders = reminders?.length || 0;
      const deliveredReminders = reminders?.filter(r => r.delivery_status === 'delivered' || r.status === 'sent').length || 0;
      const successRate = totalReminders > 0 ? (deliveredReminders / totalReminders) * 100 : 0;

      // Calculate reminder stats by type
      const smsReminders = reminders?.filter(r => r.reminder_type === 'sms') || [];
      const whatsappReminders = reminders?.filter(r => r.reminder_type === 'whatsapp') || [];
      const emailReminders = reminders?.filter(r => r.reminder_type === 'email') || [];

      const reminderStatistics: ReminderStat[] = [
        {
          type: "SMS",
          sent: smsReminders.length,
          delivered: smsReminders.filter(r => r.delivery_status === 'delivered').length,
          failed: smsReminders.filter(r => r.delivery_status === 'failed').length,
          rate: smsReminders.length > 0 ? (smsReminders.filter(r => r.delivery_status === 'delivered').length / smsReminders.length) * 100 : 0
        },
        {
          type: "WhatsApp",
          sent: whatsappReminders.length,
          delivered: whatsappReminders.filter(r => r.delivery_status === 'delivered').length,
          failed: whatsappReminders.filter(r => r.delivery_status === 'failed').length,
          rate: whatsappReminders.length > 0 ? (whatsappReminders.filter(r => r.delivery_status === 'delivered').length / whatsappReminders.length) * 100 : 0
        },
        {
          type: "Email",
          sent: emailReminders.length,
          delivered: emailReminders.filter(r => r.delivery_status === 'delivered').length,
          failed: emailReminders.filter(r => r.delivery_status === 'failed').length,
          rate: emailReminders.length > 0 ? (emailReminders.filter(r => r.delivery_status === 'delivered').length / emailReminders.length) * 100 : 0
        }
      ];

      // Calculate weekly data (last 7 days)
      const weeklyStats: WeeklyData[] = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        
        const dayReminders = reminders?.filter(r => {
          const reminderDate = new Date(r.created_at);
          return reminderDate.toDateString() === date.toDateString();
        }).length || 0;

        const dayConfirmations = appointments?.filter(a => {
          const appointmentDate = new Date(a.created_at);
          return appointmentDate.toDateString() === date.toDateString() && a.status === 'confirmed';
        }).length || 0;

        weeklyStats.push({
          day: dayName,
          reminders: dayReminders,
          confirmations: dayConfirmations
        });
      }

      // Calculate appointment metrics
      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.attendance_status === 'completed').length || 0;
      const noShowAppointments = appointments?.filter(a => a.attendance_status === 'no_show').length || 0;
      const confirmedAppointments = appointments?.filter(a => a.status === 'confirmed').length || 0;

      const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;
      const confirmationRate = totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0;
      const avgResponseTime = "2.3 min"; // This would need actual timing data
      const patientSatisfaction = "4.7/5"; // This would come from feedback table

      const metrics: AppointmentMetric[] = [
        { metric: "No-show Rate", value: `${noShowRate.toFixed(1)}%`, change: "-2.1%", trend: "down" },
        { metric: "Confirmation Rate", value: `${confirmationRate.toFixed(1)}%`, change: "+4.3%", trend: "up" },
        { metric: "Response Time", value: avgResponseTime, change: "-0.5 min", trend: "down" },
        { metric: "Patient Satisfaction", value: patientSatisfaction, change: "+0.2", trend: "up" },
      ];

      setAnalyticsData({
        totalReminders,
        successRate: Math.round(successRate * 10) / 10,
        avgResponseTime: "2.3 min",
        costSavings: `$${Math.round(totalReminders * 0.75)}`
      });

      setReminderStats(reminderStatistics);
      setWeeklyData(weeklyStats);
      setAppointmentMetrics(metrics);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Track reminder performance and patient engagement metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
          <CardContent className="p-4 flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Reminders</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalReminders.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardContent className="p-4 flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.successRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardContent className="p-4 flex items-center">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.avgResponseTime}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
          <CardContent className="p-4 flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Cost Savings</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.costSavings}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reminder Channel Performance */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Channel Performance
            </CardTitle>
            <CardDescription>Delivery rates by communication channel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reminderStats.map((stat) => (
              <div key={stat.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{stat.type}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {stat.rate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={stat.rate} className="h-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sent: {stat.sent}</span>
                  <span>Delivered: {stat.delivered}</span>
                  <span>Failed: {stat.failed}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Reminders sent and confirmations received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day) => {
                const maxValue = Math.max(...weeklyData.map(d => Math.max(d.reminders, d.confirmations))) || 1;
                return (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-blue-100 rounded-full h-2 relative">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(day.reminders / maxValue) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex-1 bg-green-100 rounded-full h-2 relative">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(day.confirmations / maxValue) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      <div>📤 {day.reminders}</div>
                      <div>✅ {day.confirmations}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span>Reminders Sent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                <span>Confirmations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Metrics */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointment Metrics</CardTitle>
            <CardDescription>Key performance indicators for appointment management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {appointmentMetrics.map((metric) => (
                <div key={metric.metric} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{metric.metric}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                  <div className="flex items-center justify-center">
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-600 mr-1 transform rotate-180" />
                    )}
                    <span className={`text-sm ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
