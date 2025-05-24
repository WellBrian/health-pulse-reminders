
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react";

const AnalyticsDashboard = () => {
  const analyticsData = {
    totalReminders: 1247,
    successRate: 94.2,
    avgResponseTime: "2.3 min",
    costSavings: "$12,450"
  };

  const reminderStats = [
    { type: "SMS", sent: 456, delivered: 445, failed: 11, rate: 97.6 },
    { type: "WhatsApp", sent: 328, delivered: 315, failed: 13, rate: 96.0 },
    { type: "Email", sent: 463, delivered: 421, failed: 42, rate: 90.9 },
  ];

  const weeklyData = [
    { day: "Mon", reminders: 45, confirmations: 41 },
    { day: "Tue", reminders: 52, confirmations: 48 },
    { day: "Wed", reminders: 38, confirmations: 35 },
    { day: "Thu", reminders: 61, confirmations: 57 },
    { day: "Fri", reminders: 48, confirmations: 44 },
    { day: "Sat", reminders: 23, confirmations: 21 },
    { day: "Sun", reminders: 15, confirmations: 14 },
  ];

  const appointmentMetrics = [
    { metric: "No-show Rate", value: "8.2%", change: "-2.1%", trend: "down" },
    { metric: "Confirmation Rate", value: "91.5%", change: "+4.3%", trend: "up" },
    { metric: "Response Time", value: "2.3 min", change: "-0.5 min", trend: "down" },
    { metric: "Patient Satisfaction", value: "4.7/5", change: "+0.2", trend: "up" },
  ];

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
                    {stat.rate}%
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
              {weeklyData.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-blue-100 rounded-full h-2 relative">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(day.reminders / 70) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex-1 bg-green-100 rounded-full h-2 relative">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(day.confirmations / 70) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 text-right">
                    <div>📤 {day.reminders}</div>
                    <div>✅ {day.confirmations}</div>
                  </div>
                </div>
              ))}
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

      {/* Recent Activity */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest reminder activity and patient responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "2 min ago", action: "SMS reminder sent to Sarah Johnson", status: "delivered" },
              { time: "5 min ago", action: "WhatsApp confirmation from Michael Chen", status: "confirmed" },
              { time: "12 min ago", action: "Email reminder failed for Emily Davis", status: "failed" },
              { time: "18 min ago", action: "SMS reminder sent to Robert Wilson", status: "delivered" },
              { time: "25 min ago", action: "Appointment confirmed by Alice Brown", status: "confirmed" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === "delivered" ? "bg-blue-400" :
                    activity.status === "confirmed" ? "bg-green-400" : "bg-red-400"
                  }`}></div>
                  <span className="text-sm text-gray-900">{activity.action}</span>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
