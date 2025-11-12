import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Send, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: { name, email, message },
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try emailing us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <SEO 
        title="Contact Us - Get In Touch Today"
        description="Contact OneStop Application Services LLC. Call +1 (571) 660-4984, email us, or message on Telegram. We're here to help with your application needs."
      />
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-primary py-24 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Get In Touch
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Have questions? We're here to help you every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
                <span className="text-secondary font-semibold">Send Us a Message</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 text-primary">
                Quick Contact Form
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Fill out the form below and we'll respond as soon as possible.
              </p>

              <Card className="shadow-elegant border-0">
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-base">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-base">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-base">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        required
                        className="mt-2 min-h-[150px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
                <span className="text-secondary font-semibold">Contact Information</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 text-primary">
                Reach Us Directly
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Prefer to reach out directly? Use any of the methods below.
              </p>

              <div className="space-y-6">
                <Card className="shadow-card hover:shadow-hover transition-smooth border-0 gradient-card group">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Phone className="w-7 h-7 text-secondary" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-primary">Phone</h3>
                        <a
                          href="tel:+15716604984"
                          className="text-muted-foreground hover:text-secondary transition-smooth text-lg"
                        >
                          +1 (571) 660-4984
                        </a>
                        <p className="text-sm text-muted-foreground mt-2">
                          Monday - Friday, 9 AM - 6 PM EST
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-hover transition-smooth border-0 gradient-card group">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Mail className="w-7 h-7 text-secondary" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-2 text-primary">Email</h3>
                        <a
                          href="mailto:onestopapplicationservicesllc@gmail.com"
                          className="text-muted-foreground hover:text-secondary transition-smooth break-all"
                        >
                          onestopapplicationservicesllc@gmail.com
                        </a>
                        <p className="text-sm text-muted-foreground mt-2">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-hover transition-smooth border-0 gradient-card group">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Send className="w-7 h-7 text-secondary" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-primary">Telegram</h3>
                        <a
                          href="https://t.me/OneStop_Application_Services_LLC"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-secondary transition-smooth"
                        >
                          @OneStop_Application_Services_LLC
                        </a>
                        <p className="text-sm text-muted-foreground mt-2">
                          Fast messaging support
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-hover transition-smooth border-0 gradient-card group">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <MapPin className="w-7 h-7 text-secondary" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-primary">Location</h3>
                        <p className="text-muted-foreground">
                          Virtual Office<br />
                          Woodbridge, VA
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Remote services available nationwide
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 gradient-primary">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Start Your Application?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Book an appointment and let our experts guide you through the process.
            </p>
            <Link to="/appointment">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg shadow-elegant">
                Book Appointment
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;