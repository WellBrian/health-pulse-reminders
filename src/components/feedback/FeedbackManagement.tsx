
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Feedback {
  id: string;
  rating: number;
  feedback_text: string;
  feedback_type: string;
  created_at: string;
  patients: { name: string } | null;
  appointments: {
    appointment_date: string;
    doctors: { name: string } | null;
  } | null;
}

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedback: 0,
    positiveCount: 0,
    negativeCount: 0
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const fetchFeedback = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          patients(name),
          appointments(
            appointment_date,
            doctors(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        toast({
          title: "Error",
          description: "Failed to fetch feedback",
          variant: "destructive"
        });
        return;
      }

      const feedbackData = data || [];
      setFeedback(feedbackData);

      // Calculate statistics
      const totalFeedback = feedbackData.length;
      const ratingsSum = feedbackData.reduce((sum, item) => sum + (item.rating || 0), 0);
      const averageRating = totalFeedback > 0 ? ratingsSum / totalFeedback : 0;
      const positiveCount = feedbackData.filter(item => (item.rating || 0) >= 4).length;
      const negativeCount = feedbackData.filter(item => (item.rating || 0) <= 2).length;

      setStats({
        averageRating,
        totalFeedback,
        positiveCount,
        negativeCount
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getFeedbackBadge = (rating: number) => {
    if (rating >= 4) return { variant: "default" as const, color: "bg-green-100 text-green-800", label: "Positive" };
    if (rating <= 2) return { variant: "destructive" as const, color: "bg-red-100 text-red-800", label: "Negative" };
    return { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800", label: "Neutral" };
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Patient Feedback</h2>
        <p className="text-gray-600">Monitor patient satisfaction and reviews</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <Star className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}/5</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Positive Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.positiveCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4 flex items-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalFeedback > 0 ? Math.round((stats.positiveCount / stats.totalFeedback) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <div className="grid gap-4">
        {feedback.map((item) => (
          <Card key={item.id} className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.patients?.name || 'Anonymous Patient'}
                    </h3>
                    <div className="flex items-center gap-1">
                      {renderStars(item.rating || 0)}
                    </div>
                    <Badge className={getFeedbackBadge(item.rating || 0).color}>
                      {getFeedbackBadge(item.rating || 0).label}
                    </Badge>
                  </div>
                  
                  {item.feedback_text && (
                    <p className="text-gray-700 mb-3 italic">"{item.feedback_text}"</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <p>👨‍⚕️ Dr. {item.appointments?.doctors?.name || 'Unknown'}</p>
                    <p>📅 {item.appointments?.appointment_date ? formatDate(item.appointments.appointment_date) : 'N/A'}</p>
                    <p>🗓️ Feedback: {formatDate(item.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedback.length === 0 && !loading && (
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback available</h3>
            <p className="text-gray-600">Patient feedback will appear here once submitted</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackManagement;
