import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockEvents } from "@/data/mockEvents";

const EmailNotifications = () => {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [emailType, setEmailType] = useState<"confirmation" | "reminder">("confirmation");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSendEmail = () => {
    if (!selectedEvent || !subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending email
    toast({
      title: "Email Sent",
      description: `${emailType === 'confirmation' ? 'Confirmation' : 'Reminder'} email sent to all attendees.`,
    });

    // Reset form
    setSubject("");
    setMessage("");
  };

  const loadTemplate = () => {
    if (emailType === "confirmation") {
      setSubject("Event Booking Confirmation");
      setMessage(
        "Dear Attendee,\n\nThank you for booking your spot at [Event Name]!\n\nEvent Details:\nDate: [Event Date]\nTime: [Event Time]\nLocation: [Event Location]\n\nWe look forward to seeing you there!\n\nBest regards,\nEvent Team"
      );
    } else {
      setSubject("Event Reminder - Tomorrow!");
      setMessage(
        "Dear Attendee,\n\nThis is a friendly reminder about your upcoming event:\n\n[Event Name]\nDate: [Event Date]\nTime: [Event Time]\nLocation: [Event Location]\n\nPlease arrive 15 minutes early for check-in.\n\nSee you soon!\n\nBest regards,\nEvent Team"
      );
    }
  };

  const sentEmails = [
    { type: "Confirmation", event: "AI Summit", recipients: 45, date: "2024-03-15 10:30 AM" },
    { type: "Reminder", event: "Marketing Bootcamp", recipients: 38, date: "2024-03-14 02:15 PM" },
    { type: "Confirmation", event: "Cloud Workshop", recipients: 42, date: "2024-03-13 09:00 AM" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Notifications</h2>
        <p className="text-muted-foreground">Send confirmation emails and reminders to attendees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Email</CardTitle>
          <CardDescription>Create and send emails to event attendees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {mockEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailType">Email Type</Label>
              <Select
                value={emailType}
                onValueChange={(value) => setEmailType(value as "confirmation" | "reminder")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmation">Confirmation Email</SelectItem>
                  <SelectItem value="reminder">Event Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter email message"
              rows={8}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSendEmail}>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button variant="outline" onClick={loadTemplate}>
              Load Template
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>Recently sent emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentEmails.map((email, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {email.type === "Confirmation" ? (
                      <Mail className="h-5 w-5 text-primary" />
                    ) : (
                      <Clock className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{email.type} - {email.event}</p>
                    <p className="text-sm text-muted-foreground">{email.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{email.recipients} recipients</p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailNotifications;
