
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Users, Bell, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

interface Metrics {
  todayAppointments: number;
  activePatients: number;
  remindersSent: number;
  successRate: number;
}

const DynamicMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    todayAppointments: 0,
    activePatients: 0,
    remindersSent: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch today's appointments
      const { data: todayAppts, error: apptsError } = await supabase
        .from('appointments')
        .select('id')
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString());

      // Fetch active patients (total patients in system)
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id');

      // Fetch sent reminders
      const { data: reminders, error: remindersError } = await supabase
        .from('reminders')
        .select('id')
        .eq('status', 'sent');

      // Calculate success rate based on completed appointments vs total appointments
      const { data: completedAppts, error: completedError } = await supabase
        .from('appointments')
        .select('id')
        .eq('attendance_status', 'completed');

      const { data: totalAppts, error: totalError } = await supabase
        .from('appointments')
        .select('id');

      if (apptsError || patientsError || remindersError || completedError || totalError) {
        console.error('Error fetching metrics:', { 
          apptsError, 
          patientsError, 
          remindersError, 
          completedError, 
          totalError 
        });
        return;
      }

      const todayAppointments = todayAppts?.length || 0;
      const activePatients = patients?.length || 0;
      const remindersSent = reminders?.length || 0;
      const completedCount = completedAppts?.length || 0;
      const totalCount = totalAppts?.length || 0;
      const successRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      setMetrics({
        todayAppointments,
        activePatients,
        remindersSent,
        successRate
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className={`${currentTheme.colors.background} backdrop-blur-sm ${currentTheme.colors.accent}`}>
            <CardContent className="p-4 flex items-center">
              <div className="h-8 w-8 bg-gray-300 rounded mr-3 animate-pulse"></div>
              <div>
                <div className="h-4 w-20 bg-gray-300 rounded mb-1 animate-pulse"></div>
                <div className="h-6 w-12 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className={`${currentTheme.colors.background} backdrop-blur-sm ${currentTheme.colors.accent}`}>
        <CardContent className="p-4 flex items-center">
          <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Today's Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.todayAppointments}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-green-100`}>
        <CardContent className="p-4 flex items-center">
          <Users className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Active Patients</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.activePatients}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-purple-100`}>
        <CardContent className="p-4 flex items-center">
          <Bell className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Reminders Sent</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.remindersSent}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`${currentTheme.colors.background} backdrop-blur-sm border-orange-100`}>
        <CardContent className="p-4 flex items-center">
          <BarChart3 className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.successRate.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicMetrics;
