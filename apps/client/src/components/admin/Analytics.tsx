import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, DollarSign } from "lucide-react";

const Analytics = () => {
  // Mock analytics data
  const stats = [
    {
      title: "Total Events",
      value: "12",
      change: "+2 this month",
      icon: Calendar,
    },
    {
      title: "Total Bookings",
      value: "248",
      change: "+18% from last month",
      icon: Users,
    },
    {
      title: "Attendance Rate",
      value: "94%",
      change: "+5% from last month",
      icon: TrendingUp,
    },
    {
      title: "Revenue",
      value: "$12,450",
      change: "+23% from last month",
      icon: DollarSign,
    },
  ];

  const recentEvents = [
    { name: "AI & Machine Learning Summit", bookings: 45, capacity: 50, date: "2024-03-25" },
    { name: "Digital Marketing Bootcamp", bookings: 38, capacity: 40, date: "2024-03-28" },
    { name: "Cloud Computing Workshop", bookings: 42, capacity: 45, date: "2024-04-02" },
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Events Performance</CardTitle>
          <CardDescription>Booking statistics for upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.bookings}/{event.capacity}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((event.bookings / event.capacity) * 100)}% filled
                    </p>
                  </div>
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(event.bookings / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
