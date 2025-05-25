
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Database, Mail, MessageSquare, Phone, Wifi } from "lucide-react";

interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  icon: React.ComponentType<any>;
  lastChecked: Date;
  responseTime?: number;
  errorRate?: number;
}

const SystemStatus = () => {
  const [services, setServices] = useState<SystemService[]>([
    {
      name: 'Database',
      status: 'operational',
      icon: Database,
      lastChecked: new Date(),
      responseTime: 0,
      errorRate: 0
    },
    {
      name: 'SMS Service',
      status: 'operational',
      icon: Phone,
      lastChecked: new Date(),
      responseTime: 0,
      errorRate: 0
    },
    {
      name: 'WhatsApp API',
      status: 'operational',
      icon: MessageSquare,
      lastChecked: new Date(),
      responseTime: 0,
      errorRate: 0
    },
    {
      name: 'Email Service',
      status: 'operational',
      icon: Mail,
      lastChecked: new Date(),
      responseTime: 0,
      errorRate: 0
    },
    {
      name: 'API Connectivity',
      status: 'operational',
      icon: Wifi,
      lastChecked: new Date(),
      responseTime: 0,
      errorRate: 0
    }
  ]);

  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational');

  const checkDatabaseHealth = async (): Promise<{ status: 'operational' | 'degraded' | 'down', responseTime: number }> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.error('Database health check failed:', error);
        return { status: 'down', responseTime };
      }
      
      if (responseTime > 2000) {
        return { status: 'degraded', responseTime };
      }
      
      return { status: 'operational', responseTime };
    } catch (error) {
      return { status: 'down', responseTime: Date.now() - startTime };
    }
  };

  const checkAPIConnectivity = async (): Promise<{ status: 'operational' | 'degraded' | 'down', responseTime: number }> => {
    const startTime = Date.now();
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      const responseTime = Date.now() - startTime;
      
      if (error && error.message !== 'Invalid JWT') {
        return { status: 'down', responseTime };
      }
      
      if (responseTime > 1000) {
        return { status: 'degraded', responseTime };
      }
      
      return { status: 'operational', responseTime };
    } catch (error) {
      return { status: 'down', responseTime: Date.now() - startTime };
    }
  };

  const checkExternalServices = async () => {
    // Simulate checking external services (SMS, WhatsApp, Email)
    // In a real implementation, you would check actual service endpoints
    const services = ['SMS Service', 'WhatsApp API', 'Email Service'];
    const results = services.map(service => {
      const responseTime = Math.random() * 1000 + 200; // Simulate response time
      const isDown = Math.random() < 0.05; // 5% chance of being down
      const isDegraded = Math.random() < 0.1; // 10% chance of being degraded
      
      let status: 'operational' | 'degraded' | 'down' = 'operational';
      if (isDown) status = 'down';
      else if (isDegraded) status = 'degraded';
      
      return { service, status, responseTime };
    });
    
    return results;
  };

  const performHealthChecks = async () => {
    try {
      // Check database
      const dbHealth = await checkDatabaseHealth();
      
      // Check API connectivity
      const apiHealth = await checkAPIConnectivity();
      
      // Check external services
      const externalServices = await checkExternalServices();
      
      // Update services state
      setServices(prevServices => 
        prevServices.map(service => {
          const now = new Date();
          
          if (service.name === 'Database') {
            return {
              ...service,
              status: dbHealth.status,
              responseTime: dbHealth.responseTime,
              lastChecked: now,
              errorRate: dbHealth.status === 'down' ? 100 : (dbHealth.status === 'degraded' ? 25 : 0)
            };
          }
          
          if (service.name === 'API Connectivity') {
            return {
              ...service,
              status: apiHealth.status,
              responseTime: apiHealth.responseTime,
              lastChecked: now,
              errorRate: apiHealth.status === 'down' ? 100 : (apiHealth.status === 'degraded' ? 15 : 0)
            };
          }
          
          // Handle external services
          const externalService = externalServices.find(ext => ext.service === service.name);
          if (externalService) {
            return {
              ...service,
              status: externalService.status,
              responseTime: externalService.responseTime,
              lastChecked: now,
              errorRate: externalService.status === 'down' ? 100 : (externalService.status === 'degraded' ? 20 : 0)
            };
          }
          
          return service;
        })
      );
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  useEffect(() => {
    // Initial health check
    performHealthChecks();
    
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(performHealthChecks, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate overall system status
    const downServices = services.filter(s => s.status === 'down').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    
    if (downServices > 0) {
      setOverallStatus('down');
    } else if (degradedServices > 0) {
      setOverallStatus('degraded');
    } else {
      setOverallStatus('operational');
    }
  }, [services]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-400';
      case 'degraded':
        return 'bg-yellow-400';
      case 'down':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getOverallHealthPercentage = () => {
    const operationalServices = services.filter(s => s.status === 'operational').length;
    return Math.round((operationalServices / services.length) * 100);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Status
          </div>
          <Badge variant={overallStatus === 'operational' ? 'default' : overallStatus === 'degraded' ? 'secondary' : 'destructive'}>
            {getOverallHealthPercentage()}% Operational
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right text-xs text-gray-500">
                  {service.responseTime && (
                    <div>{service.responseTime}ms</div>
                  )}
                  {service.errorRate !== undefined && service.errorRate > 0 && (
                    <div>{service.errorRate}% error</div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusDot(service.status)} ${service.status === 'operational' ? 'animate-pulse' : ''}`}></div>
                  <span className={`text-sm capitalize ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
