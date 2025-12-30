import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Award, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  stats: {
    totalEvents: { value: number; change: string };
    totalBookings: { value: number; change: string };
    attendanceRate: { value: string; change: string };
  };
  popularEvents: Array<{
    name: string;
    bookings: number;
    capacity: number;
    date: string;
    fillPercentage: number;
  }>;
  recentEvents: Array<{
    name: string;
    bookings: number;
    capacity: number;
    date: string;
    fillPercentage: number;
  }>;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDashboardStats();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Failed to load analytics data
      </div>
    );
  }

  const stats = [
    {
      title: "Total Events",
      value: dashboardData.stats.totalEvents.value.toString(),
      change: dashboardData.stats.totalEvents.change,
      icon: Calendar,
    },
    {
      title: "Total Bookings",
      value: dashboardData.stats.totalBookings.value.toString(),
      change: dashboardData.stats.totalBookings.change,
      icon: Users,
    },
    {
      title: "Attendance Rate",
      value: dashboardData.stats.attendanceRate.value,
      change: dashboardData.stats.attendanceRate.change,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics Overview</h2>
        <p className="text-muted-foreground">Track your event performance and metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Popular Events
            </CardTitle>
            <CardDescription>Most booked events of all time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.popularEvents.length > 0 ? (
                dashboardData.popularEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.bookings}/{event.capacity}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.fillPercentage}% filled
                        </p>
                      </div>
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${event.fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Past Events</CardTitle>
            <CardDescription>Performance of recently completed events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentEvents.length > 0 ? (
                dashboardData.recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.bookings}/{event.capacity}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.fillPercentage}% filled
                        </p>
                      </div>
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${event.fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No past events available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
