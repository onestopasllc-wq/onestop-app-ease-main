import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, MapPin, Phone, User, BookOpen, ClipboardList, Smartphone, Apple, Play, ArrowRight, Download, Loader2, Ban } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import appStoreBadge from "@/assets/applestorebuge.png";

const interestAreas = [
  "Healthcare",
  "Technology",
  "Business",
  "Engineering",
];

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phoneNumber: z.string().min(5, "Please enter a valid phone number"),
  areasOfInterest: z.array(z.string()).min(1, "Please select at least one area of interest"),
  otherInterest: z.string().max(100).optional(),
  cityState: z.string().min(2, "Please enter your city and state"),
});

type FormData = z.infer<typeof formSchema>;

export default function EventRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  useEffect(() => {
    fetchActiveEvent();
  }, []);

  const fetchActiveEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gt('registration_deadline', new Date().toISOString())
        .order('registration_deadline', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      areasOfInterest: [],
      otherInterest: "",
      cityState: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-event-checkout',
        {
          body: {
            eventId: activeEvent?.id,
            registrationData: {
              full_name: data.fullName,
              email: data.email,
              phone_number: data.phoneNumber,
              areas_of_interest: data.areasOfInterest,
              other_interest: data.otherInterest || null,
              city_state: data.cityState,
            }
          },
        }
      );

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      }

    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to proceed to payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <SEO
        title="Event Registration - OneStop Application Services"
        description="Register for our upcoming event and reserve your spot today."
      />
      <Navbar />
      <div className="min-h-screen relative overflow-hidden pt-24 pb-16">
        <AnimatedBackground />

        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <ClipboardList className="w-4 h-4" /> Official Registration Gateway
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-primary"
            >
              {activeEvent ? activeEvent.title : "Event Registration"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
            >
              {activeEvent ? activeEvent.description : "Join the elite circle of professionals and innovators. Complete your registration to access exclusive event features."}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Right Column (Desktop) / Top Column (Mobile): Registration Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 lg:order-2"
            >
              {isLoadingEvent ? (
                <Card className="border-none shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center p-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </Card>
              ) : activeEvent ? (
                <Card className="border-none shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10">
                <CardContent className="p-8 md:p-12">
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold mb-2">Registration Form</h3>
                    <p className="text-muted-foreground">Complete the details below to finalize your attendance.</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Full Name
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" className="h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Email Field */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Email Address
                              </FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" className="h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Phone Field */}
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="+1 (555) 000-0000" className="h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* City & State Field */}
                        <FormField
                          control={form.control}
                          name="cityState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> City & State
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Alexandria, VA" className="h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Area of Interest Selection */}
                      <FormField
                        control={form.control}
                        name="areasOfInterest"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                              <BookOpen className="w-3.5 h-3.5" /> Primary Areas of Interest
                            </FormLabel>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              {interestAreas.map((area) => (
                                <FormField
                                  key={area}
                                  control={form.control}
                                  name="areasOfInterest"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-muted p-4 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(area)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, area])
                                              : field.onChange(
                                                field.value?.filter((value) => value !== area)
                                              );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-medium cursor-pointer text-sm">
                                        {area}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Other Interest */}
                      <FormField
                        control={form.control}
                        name="otherInterest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Other Interests (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="What else are you looking for?" className="h-12 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Section */}
                      <div className="pt-6 border-t border-muted">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl border border-primary/20 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary text-white">
                              <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-lg">Registration Fee</p>
                              <p className="text-sm text-muted-foreground">Secure Stripe Checkout</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-black text-primary tracking-tighter">$30</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">One-time payment</p>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin h-5 w-5 border-3 border-current border-t-transparent rounded-full mr-3"></div>
                              Processing Securely...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-6 w-6" />
                              Complete Registration
                            </>
                          )}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Encrypted 256-bit Secure Payment
                        </p>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              ) : (
                <Card className="border-none shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 p-12 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Ban className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-zinc-900 dark:text-white">Registration Closed</h3>
                      <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        We're sorry, but registration for this event is currently closed or has reached capacity.
                      </p>
                    </div>
                    <Button variant="outline" size="lg" className="rounded-xl px-8" onClick={() => window.location.href = '/'}>
                      Return to Home
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>

            {/* Left Column (Desktop) / Bottom Column (Mobile): Info & App Pass */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-5 lg:order-1 space-y-8"
            >
              <Card className="border-none shadow-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 backdrop-blur-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Smartphone className="w-32 h-32 rotate-12" />
                </div>
                <CardContent className="p-8 md:p-10 relative z-10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-primary text-white">
                      <Download className="w-6 h-6" />
                    </span>
                    OneStop Hub
                  </h2>
                  <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                    Elevate your event experience with our mobile companion. Manage registrations, get real-time updates, and network with ease.
                  </p>

                  <div className="space-y-8">
                    {/* QR Code Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-primary/10 hover:border-primary/30 transition-all group/qr">
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://apps.apple.com/app/id6759644249" 
                            alt="Scan for iOS"
                            className="w-full h-auto"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground justify-center">
                          <Apple className="w-3 h-3" /> App Store
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-primary/10 hover:border-primary/30 transition-all group/qr">
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://play.google.com/store/apps/details?id=com.onestopasllc.app&hl=en" 
                            alt="Scan for Android"
                            className="w-full h-auto"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground justify-center">
                          <Play className="w-3 h-3" /> Google Play
                        </div>
                      </div>
                    </div>

                    {/* App Badges */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <a
                        href="https://apps.apple.com/app/id6759644249"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 transition-transform hover:-translate-y-1"
                      >
                        <img src={appStoreBadge} alt="App Store" className="h-12 w-auto mx-auto lg:mx-0" />
                      </a>
                      <a
                        href="https://play.google.com/store/apps/details?id=com.onestopasllc.app&hl=en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 transition-transform hover:-translate-y-1"
                      >
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                          alt="Google Play" 
                          className="h-12 w-auto mx-auto lg:mx-0" 
                        />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Highlights/Benefits */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: CheckCircle2, title: "Instant Confirmation", desc: "Receive your digital ticket via email immediately." },
                  { icon: ArrowRight, title: "Priority Access", desc: "Skip the lines with our mobile check-in feature." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 backdrop-blur-md"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}