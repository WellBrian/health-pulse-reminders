
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Settings, Play, Pause, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger_time: string;
  reminder_type: string;
  frequency: string;
  message_template: string;
  created_at: string;
}

const AutomatedReminders = () => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [newRule, setNewRule] = useState({
    name: "",
    trigger_time: "24", // hours before appointment
    reminder_type: "sms",
    frequency: "once",
    message_template: "",
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAutomationRules();
  }, [user]);

  const fetchAutomationRules = async () => {
    // For now, we'll simulate automation rules since we don't have a table for them
    // In a real implementation, you'd create an automation_rules table
    setAutomationRules([
      {
        id: '1',
        name: '24 Hour SMS Reminder',
        enabled: true,
        trigger_time: '24',
        reminder_type: 'sms',
        frequency: 'daily',
        message_template: 'Hi {patientName}, you have an appointment tomorrow at {appointmentTime}',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '2 Hour Email Reminder',
        enabled: false,
        trigger_time: '2',
        reminder_type: 'email',
        frequency: 'once',
        message_template: 'Your appointment is in 2 hours at {appointmentTime}',
        created_at: new Date().toISOString()
      }
    ]);
  };

  const createAutomationRule = async () => {
    if (!newRule.name || !newRule.message_template) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you'd insert into an automation_rules table
      const rule: AutomationRule = {
        id: Date.now().toString(),
        name: newRule.name,
        enabled: newRule.enabled,
        trigger_time: newRule.trigger_time,
        reminder_type: newRule.reminder_type,
        frequency: newRule.frequency,
        message_template: newRule.message_template,
        created_at: new Date().toISOString()
      };

      setAutomationRules(prev => [rule, ...prev]);
      
      toast({
        title: "Success",
        description: "Automation rule created successfully",
      });

      setNewRule({
        name: "",
        trigger_time: "24",
        reminder_type: "sms",
        frequency: "once",
        message_template: "",
        enabled: true
      });

      // Here you would also set up the actual scheduling logic
      await scheduleReminders(rule);

    } catch (error) {
      console.error('Error creating automation rule:', error);
      toast({
        title: "Error",
        description: "Failed to create automation rule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      )
    );

    const rule = automationRules.find(r => r.id === ruleId);
    if (rule) {
      if (enabled) {
        await scheduleReminders({ ...rule, enabled });
        toast({
          title: "Rule Activated",
          description: `"${rule.name}" is now active`,
        });
      } else {
        toast({
          title: "Rule Deactivated",
          description: `"${rule.name}" has been paused`,
        });
      }
    }
  };

  const scheduleReminders = async (rule: AutomationRule) => {
    try {
      // Get upcoming appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          patients!fk_appointments_patient_id(name, phone, email)
        `)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date');

      if (!appointments) return;

      for (const appointment of appointments) {
        const appointmentDate = new Date(appointment.appointment_date);
        const reminderTime = new Date(appointmentDate);
        reminderTime.setHours(reminderTime.getHours() - parseInt(rule.trigger_time));

        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          // Insert reminder into database
          const { error } = await supabase
            .from('reminders')
            .insert({
              appointment_id: appointment.id,
              reminder_type: rule.reminder_type,
              reminder_time: reminderTime.toISOString(),
              message: rule.message_template
                .replace('{patientName}', appointment.patients?.name || 'Patient')
                .replace('{appointmentTime}', appointmentDate.toLocaleTimeString()),
              status: 'pending'
            });

          if (error) {
            console.error('Error scheduling reminder:', error);
          }
        }
      }

      console.log(`Scheduled reminders for rule: ${rule.name}`);
    } catch (error) {
      console.error('Error in scheduleReminders:', error);
    }
  };

  const getFrequencyOptions = () => [
    { value: "once", label: "One time only" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
  ];

  const getTriggerTimeOptions = () => [
    { value: "0.5", label: "30 minutes before" },
    { value: "1", label: "1 hour before" },
    { value: "2", label: "2 hours before" },
    { value: "4", label: "4 hours before" },
    { value: "12", label: "12 hours before" },
    { value: "24", label: "24 hours before" },
    { value: "48", label: "48 hours before" },
    { value: "168", label: "1 week before" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Automated Reminders</h3>
        <p className="text-gray-600">Set up automatic reminder rules for appointments</p>
      </div>

      {/* Create New Rule */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-blue-600" />
            Create Automation Rule
          </CardTitle>
          <CardDescription>Set up a new automated reminder rule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rule-name">Rule Name *</Label>
              <Input
                id="rule-name"
                placeholder="e.g., 24h SMS Reminder"
                value={newRule.name}
                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="trigger-time">Send Reminder</Label>
              <Select value={newRule.trigger_time} onValueChange={(value) => setNewRule({...newRule, trigger_time: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="When to send" />
                </SelectTrigger>
                <SelectContent>
                  {getTriggerTimeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reminder-type">Reminder Type</Label>
              <Select value={newRule.reminder_type} onValueChange={(value) => setNewRule({...newRule, reminder_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={newRule.frequency} onValueChange={(value) => setNewRule({...newRule, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="How often" />
                </SelectTrigger>
                <SelectContent>
                  {getFrequencyOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message-template">Message Template *</Label>
            <Input
              id="message-template"
              placeholder="Hi {patientName}, you have an appointment at {appointmentTime}"
              value={newRule.message_template}
              onChange={(e) => setNewRule({...newRule, message_template: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {"{patientName}"}, {"{appointmentTime}"}, {"{doctorName}"}, {"{clinicName}"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-enable" 
              checked={newRule.enabled}
              onCheckedChange={(checked) => setNewRule({...newRule, enabled: checked})}
            />
            <Label htmlFor="auto-enable">Enable rule immediately</Label>
          </div>

          <Button onClick={createAutomationRule} disabled={loading} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Create Automation Rule
          </Button>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-green-600" />
            Active Automation Rules ({automationRules.filter(r => r.enabled).length})
          </CardTitle>
          <CardDescription>Manage your automated reminder rules</CardDescription>
        </CardHeader>
        <CardContent>
          {automationRules.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>No automation rules created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {automationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <Badge className={rule.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {rule.enabled ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {rule.reminder_type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Send {rule.trigger_time}h before • {rule.frequency} • "{rule.message_template.substring(0, 50)}..."
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                    />
                    <Button variant="outline" size="sm">
                      {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedReminders;
