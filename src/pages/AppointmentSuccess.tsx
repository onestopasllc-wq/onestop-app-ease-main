import { motion } from "framer-motion";
import { CheckCircle, Calendar, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function AppointmentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-elegant border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-teal" />
              </div>
            </div>
            <CardTitle className="text-3xl text-navy mb-2">
              Appointment Confirmed! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Your booking has been successfully completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-light-gray rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg text-navy">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-teal mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Confirmation Email</p>
                    <p className="text-sm text-gray-600">
                      You'll receive a confirmation email with your appointment details shortly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-teal mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Appointment Reminder</p>
                    <p className="text-sm text-gray-600">
                      We'll send you a reminder 24 hours before your scheduled appointment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-teal mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Get in Touch</p>
                    <p className="text-sm text-gray-600">
                      If you have any questions, feel free to contact us at{" "}
                      <a href="tel:+15716604984" className="text-teal hover:underline">
                        +1 (571) 660-4984
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-primary/10 rounded-lg p-6 text-center">
              <p className="text-navy font-medium mb-2">
                Thank you for choosing OneStop Application Services!
              </p>
              <p className="text-sm text-gray-600">
                We look forward to helping you with your application needs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/")}
                className="flex-1 bg-gradient-primary hover:scale-105 transition-all"
              >
                Return to Home
              </Button>
              <Button
                onClick={() => navigate("/services")}
                variant="outline"
                className="flex-1"
              >
                View Our Services
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
