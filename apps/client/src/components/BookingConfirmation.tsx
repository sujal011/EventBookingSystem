import { Event } from '@/types/event';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, MapPin, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';

interface BookingConfirmationProps {
  event: Event;
  bookingId: string;
}

export const BookingConfirmation = ({ event, bookingId }: BookingConfirmationProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Generate QR code from booking ID
    QRCode.toDataURL(bookingId, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [bookingId]);

  const downloadTicket = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 1000;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header background
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(0, 0, canvas.width, 150);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EVENT TICKET', canvas.width / 2, 60);

      // Subtitle
      ctx.font = '20px Arial';
      ctx.fillText('Booking Confirmation', canvas.width / 2, 100);

      // Event name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      const eventTitle = event.title.length > 40 ? event.title.substring(0, 40) + '...' : event.title;
      ctx.fillText(eventTitle, canvas.width / 2, 220);

      // Event details
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#374151';

      const details = [
        { label: 'Date:', value: new Date(event.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) },
        { label: 'Time:', value: event.time },
        { label: 'Location:', value: event.location },
      ];

      let yPos = 280;
      details.forEach((detail) => {
        ctx.fillStyle = '#6b7280';
        ctx.fillText(detail.label, 80, yPos);
        ctx.fillStyle = '#000000';
        ctx.fillText(detail.value, 180, yPos);
        yPos += 40;
      });

      // Booking ID section
      yPos += 20;
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(60, yPos, canvas.width - 120, 80);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Booking ID', canvas.width / 2, yPos + 30);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(bookingId, canvas.width / 2, yPos + 60);

      // QR Code
      if (qrCodeUrl) {
        const qrImage = new Image();
        qrImage.src = qrCodeUrl;
        await new Promise((resolve) => {
          qrImage.onload = resolve;
        });
        
        const qrSize = 200;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = yPos + 120;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
        
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan QR code for verification', canvas.width / 2, qrY + qrSize + 35);
      }

      // Footer
      const footerY = canvas.height - 80;
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, footerY, canvas.width, 80);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Please present this ticket at the event entrance', canvas.width / 2, footerY + 30);
      ctx.fillText('Keep this ticket safe and do not share with others', canvas.width / 2, footerY + 55);

      // Download
      const link = document.createElement('a');
      link.download = `ticket-${bookingId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: 'Ticket Downloaded',
        description: 'Your ticket has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download ticket. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-success">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription className="text-base mt-2">
            Your seat has been reserved successfully
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
          <p className="text-xl font-mono font-semibold">{bookingId}</p>
        </div>

        {qrCodeUrl && (
          <div className="flex flex-col items-center space-y-2">
            <img src={qrCodeUrl} alt="Booking QR Code" className="w-48 h-48 border-2 border-border rounded-lg p-2 bg-white" />
            <p className="text-xs text-muted-foreground text-center">Scan this QR code at the event entrance</p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold">Event Details</h4>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{event.title}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-accent-foreground text-black">
            <strong>Important:</strong> A confirmation email has been sent to your registered email address. Please save your booking ID for future reference.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1" onClick={downloadTicket}>
            <Download className="mr-2 h-4 w-4" />
            Download Ticket
          </Button>
          <Button asChild className="flex-1">
            <Link to="/">View All Events</Link>
          </Button>
        </div>

        {/* Hidden canvas for ticket generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};
