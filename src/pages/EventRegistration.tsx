import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, MapPin, Phone, User, BookOpen } from "lucide-react";
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
    setIsSubmitting(true);

    try {
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-event-checkout',
        {
          body: {
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

  return (
    <>
      <SEO
        title="Event Registration - OneStop Application Services"
        description="Register for our upcoming event and reserve your spot today."
      />
      <Navbar />
      <div className="min-h-screen relative overflow-hidden pt-20 pb-16">
        <AnimatedBackground />

        <div className="container max-w-2xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                📝 Event Registration Form
              </h1>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Please fill out the form below to reserve your spot
              </p>
            </div>

            <Card className="border shadow-lg bg-card/98 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <div className="space-y-4">
                      {/* Name Field */}
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" /> Full Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-11" {...field} />
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
                            <FormLabel className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" /> Email Address
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" className="h-11" {...field} />
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
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-primary" /> Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+1 (555) 000-0000" className="h-11" {...field} />
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
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" /> City & State
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Alexandria, VA" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Area of Interest Selection */}
                      <FormField
                        control={form.control}
                        name="areasOfInterest"
                        render={() => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" /> Area of Interest
                            </FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              {interestAreas.map((area) => (
                                <FormField
                                  key={area}
                                  control={form.control}
                                  name="areasOfInterest"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 transition-colors">
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
                                      <FormLabel className="font-normal cursor-pointer text-sm">
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
                            <FormLabel>Other Interest</FormLabel>
                            <FormControl>
                              <Input placeholder="Tell us if you have other interests..." className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div>
                          <p className="font-semibold text-lg flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" /> Registration Fee
                          </p>
                          <p className="text-sm text-muted-foreground">Visa, MasterCard accepted</p>
                        </div>
                        <span className="text-2xl font-bold text-primary">$0.50</span>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                            Redirecting to Payment...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Register Now - $0.50
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
