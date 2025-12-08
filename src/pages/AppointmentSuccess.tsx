import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Calendar, Clock, Mail, Home, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AppointmentSuccess() {
  const [searchParams] = useSearchParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    fetchAppointment(sessionId);
  }, [searchParams]);

  const fetchAppointment = async (sessionId: string) => {
    try {
      // Poll for appointment (webhook might take a few seconds to process)
      const maxAttempts = 15; // Try for up to 15 seconds
      let attempts = 0;

      while (attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1}/${maxAttempts} to fetch appointment for session:`, sessionId);

        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();

        if (data) {
          console.log('✅ Appointment found:', data.id);
          setAppointment(data);
          setLoading(false);
          return;
        }

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error fetching appointment:', error);
          throw error;
        }

        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      // If we get here, appointment wasn't found after max attempts
      console.warn('Appointment not found after max attempts');
      setError('Payment confirmed, but appointment is still being processed. Please check your email for confirmation, or contact support if you don\'t receive it within a few minutes.');
      setLoading(false);
    } catch (err: any) {
      console.error('Error in fetchAppointment:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative inline-block">
              <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
              <div className="absolute inset-0 h-16 w-16 border-4 border-primary/20 rounded-full mx-auto animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Confirming Your Appointment</h2>
            <p className="text-muted-foreground">Processing your payment and creating your booking...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    ⚠️
                  </div>
                  Processing Delay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Return to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container max-w-2xl mx-auto"
        >
          <Card className="border-green-200 shadow-xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <CardTitle className="text-3xl text-green-700 mb-2">Payment Successful!</CardTitle>
              <p className="text-lg text-muted-foreground">
                Your appointment has been confirmed
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Appointment Details */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 space-y-4 border border-primary/20">
                <h3 className="font-semibold text-lg text-primary mb-4">Appointment Details</h3>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Date</p>
                    <p className="text-muted-foreground">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Time</p>
                    <p className="text-muted-foreground">{appointment.appointment_time} (Eastern Time)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Confirmation Email</p>
                    <p className="text-muted-foreground">Sent to {appointment.email}</p>
                  </div>
                </div>
              </div>

              {/* Selected Services */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Selected Services</h3>
                <ul className="space-y-2">
                  {appointment.services.map((service: string, index: number) => (
                    <motion.li
                      key={service}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (index * 0.05) }}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{service}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <Alert className="border-blue-200 bg-blue-50/50">
                <AlertDescription className="text-sm text-blue-800">
                  <strong>What's Next?</strong> You'll receive a confirmation email with all the details shortly.
                  If you have any questions, please don't hesitate to contact us.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1"
                  size="lg"
                  asChild
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Return to Home
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  asChild
                >
                  <Link to="/appointment">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Book Another
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
