//pages/Appointment.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Upload, CheckCircle2, Clock, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addMinutes, isSameDay, parse } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SocialIcon } from "react-social-icons";

// List of world countries for the location dropdown
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso",
  "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const services = [
  // "Visa Form Preparation (Non-Legal)",
  "College & University Application Support",
  "Document Evaluation Application Support",
  "Exam & Licensing Board Application Support",
  "Career Readiness & Job Application Support",
  // "Business License & Related Application Support",
];

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().optional(),
  contactMethod: z.string().min(1, "Please select a contact method"),
  location: z.string().min(1, "Please select your country"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  description: z.string().max(1000).optional(),
  appointmentDate: z.date({ required_error: "Please select a date" }),
  appointmentTime: z.string().min(1, "Please select a time"),
  howHeard: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, "You must agree to continue"),
});

type FormData = z.infer<typeof formSchema>;

export default function Appointment() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      contactMethod: "",
      location: "",
      state: "",
      city: "",
      services: [],
      description: "",
      appointmentDate: undefined,
      appointmentTime: "",
      howHeard: "",
      consent: false,
    },
  });

  // Fetch working hours and blocked dates on mount
  useEffect(() => {
    fetchWorkingHours();
    fetchBlockedDates();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchWorkingHours = async () => {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      setWorkingHours(data);
    }
  };

  const fetchBlockedDates = async () => {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('blocked_date');

    if (!error && data) {
      setBlockedDates(data.map(d => new Date(d.blocked_date)));
    }
  };

  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true);
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log('Fetching available slots for', dateStr, 'dayOfWeek:', dayOfWeek);

    // Get working hours for this day
    const workingHour = workingHours.find(wh => wh.day_of_week === dayOfWeek);
    console.log('Working hour for day:', workingHour);

    if (!workingHour) {
      console.warn('No working hours configured for this day');
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    // Generate all possible slots
    const slots: string[] = [];
    const startTime = parse(workingHour.start_time, 'HH:mm:ss', new Date());
    const endTime = parse(workingHour.end_time, 'HH:mm:ss', new Date());
    const slotDuration = Number(workingHour.slot_duration || 0);

    // Safety guards to avoid infinite loops or huge generation
    if (!slotDuration || slotDuration <= 0) {
      console.warn('Invalid slot duration for working hours:', workingHour);
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    // Prevent generating an excessive number of slots (safety cap)
    const MAX_SLOTS = 500;

    let currentTime = startTime;
    let iterations = 0;
    while (currentTime < endTime && iterations < MAX_SLOTS) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = addMinutes(currentTime, slotDuration);
      iterations += 1;
    }

    if (iterations >= MAX_SLOTS) {
      console.warn('Reached max slot generation limit for date', dateStr);
    }
    console.log('Generated slots count:', slots.length);

    // Get existing appointments for this date
    const { data: existingAppointments, error: existingErr } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled');

    if (existingErr) {
      console.error('Error fetching existing appointments:', existingErr.message);
    }

    // Filter out booked slots
    const bookedSlots = existingAppointments?.map(apt => apt.appointment_time.substring(0, 5)) || [];
    console.log('Booked slots:', bookedSlots);
    const available = slots.filter(slot => !bookedSlots.includes(slot));
    console.log('Available slots count:', available.length);

    setAvailableSlots(available);
    setLoadingSlots(false);
  };

  const isDateDisabled = (date: Date) => {
    if (date < new Date()) return true;
    if (blockedDates.some(blocked => isSameDay(blocked, date))) return true;

    const dayOfWeek = date.getDay();
    const hasWorkingHours = workingHours.some(wh => wh.day_of_week === dayOfWeek);
    return !hasWorkingHours;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (selectedFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      let fileUrl = null;

      // Step 1: Upload file if exists (keep existing upload logic)
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('appointment-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('appointment-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      // Step 2: Create Stripe checkout with booking data in metadata
      // DO NOT create appointment record here - webhook will do that after payment
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout',
        {
          body: {
            bookingData: {
              full_name: data.fullName,
              email: data.email,
              phone: data.phone || null,
              contact_method: data.contactMethod,
              location: data.location,
              state: data.state,
              city: data.city,
              services: data.services,
              description: data.description || null,
              appointment_date: format(data.appointmentDate, 'yyyy-MM-dd'),
              appointment_time: data.appointmentTime,
              file_url: fileUrl,
              how_heard: data.howHeard || null,
            }
          },
        }
      );

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        // Redirect to Stripe (not opening in new tab for better UX)
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
        title="Book Appointment - Get Expert Application Support"
        description="Book your consultation with OneStop Application Services LLC. Secure your spot with a $25 deposit and get expert guidance for your application process."
      />
      <Navbar />
      <div className="min-h-screen relative overflow-hidden pt-20 pb-16">
        <AnimatedBackground />

        <div className="container max-w-3xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                Book Your Appointment
              </h1>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Fill out the form below and secure your spot with a $25 deposit
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border shadow-lg bg-card/98 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                      {/* Personal Information Section */}
                      <div className="space-y-5">
                        <div className="pb-2">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</div>
                            Personal Information
                          </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Email Address *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+1 (571) 660-4984" className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="contactMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Preferred Contact *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Choose method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="telegram">Telegram</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Country/Location *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select your country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[200px]">
                                  {COUNTRIES.map((country) => (
                                    <SelectItem key={country} value={country}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">State/Province *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., California, Ontario, etc." className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Los Angeles, Toronto, etc." className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="border-t my-6"></div>

                      {/* Services Section */}
                      <div className="space-y-5">
                        <div className="pb-2">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</div>
                            Services & Details
                          </h2>
                        </div>

                        <FormField
                          control={form.control}
                          name="services"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Select Services *</FormLabel>
                              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                                {services.map((service) => (
                                  <FormField
                                    key={service}
                                    control={form.control}
                                    name="services"
                                    render={({ field }) => (
                                      <FormItem
                                        key={service}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 transition-colors"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(service)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, service])
                                                : field.onChange(
                                                  field.value?.filter((value) => value !== service)
                                                );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer text-sm leading-tight">
                                          {service}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Additional Details</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us more about what you need help with..."
                                  className="min-h-[100px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="border-t my-6"></div>

                      {/* Date & Time Section */}
                      <div className="space-y-5">
                        <div className="pb-2">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</div>
                            Choose Date & Time
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">Available slots update in real-time</p>
                        </div>

                        {/* USA Time Zone Notice */}
                        <Alert className="border-blue-200 bg-blue-50/50">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-800">
                            <strong>Important:</strong> All appointment times are scheduled in{" "}
                            <span className="font-semibold">USA Eastern Time (ET)</span>. Please ensure you
                            convert to your local time zone when booking.
                          </AlertDescription>
                        </Alert>

                        <FormField
                          control={form.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-medium">Select Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal h-11",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "EEEE, MMMM do, yyyy")
                                      ) : (
                                        "Pick a date"
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      console.log("Date selected:", date ? format(date, 'yyyy-MM-dd') : null);
                                      field.onChange(date);
                                      setSelectedDate(date);
                                    }}
                                    disabled={isDateDisabled}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="appointmentTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Select Time Slot *</FormLabel>
                              {!selectedDate ? (
                                <div className="p-6 bg-muted/30 rounded-lg text-center border border-dashed">
                                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                  <p className="text-sm text-muted-foreground">
                                    Please select a date first
                                  </p>
                                </div>
                              ) : loadingSlots ? (
                                <div className="p-6 bg-muted/30 rounded-lg text-center">
                                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                  <p className="text-sm text-muted-foreground">Loading available slots...</p>
                                </div>
                              ) : availableSlots.length === 0 ? (
                                <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-lg text-center">
                                  <p className="text-sm text-destructive font-medium">
                                    No slots available for this date
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">Please choose another date</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {availableSlots.map((slot) => {
                                    const hour = parseInt(slot.split(':')[0]);
                                    const displayTime = `${hour > 12 ? hour - 12 : hour}:${slot.split(':')[1]} ${hour >= 12 ? 'PM' : 'AM'}`;
                                    return (
                                      <Button
                                        key={slot}
                                        type="button"
                                        variant={field.value === slot ? "default" : "outline"}
                                        className={cn(
                                          "h-11 text-sm transition-all",
                                          field.value === slot && "ring-2 ring-primary ring-offset-1 shadow-sm"
                                        )}
                                        onClick={() => field.onChange(slot)}
                                      >
                                        {displayTime}
                                      </Button>
                                    );
                                  })}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="border-t my-6"></div>

                      {/* Additional Information Section */}
                      <div className="space-y-5">
                        <div className="pb-2">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</div>
                            Additional Information
                          </h2>
                        </div>

                        <div>
                          <Label htmlFor="file" className="text-sm font-medium mb-2 block">Upload Document (Optional)</Label>
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="cursor-pointer h-11"
                          />
                          {file && (
                            <div className="flex items-center text-sm text-primary mt-2 font-medium">
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              {file.name}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="howHeard"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">How Did You Hear About Us?</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Choose an option" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="google">Google Search</SelectItem>
                                  <SelectItem value="social">Social Media</SelectItem>
                                  <SelectItem value="referral">Friend/Family Referral</SelectItem>
                                  <SelectItem value="telegram">Telegram</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="consent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-accent/20">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer text-sm">
                                  I consent to the collection and use of my information for appointment scheduling *
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Complete Booking - $25 Deposit
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Social Media Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-gray-50 to-blue-50 relative z-10 mt-20 mb-16">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-primary">
                Stay Connected With Us
              </h2>
              <p className="text-muted-foreground mb-8 text-base sm:text-lg">
                Follow us on social media for updates, tips, and success stories
              </p>

              <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap">
                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon
                    url="https://t.me/OneStop_Application_Services_LLC"
                    className="shadow-lg group-hover:shadow-xl transition-all duration-300"
                    style={{ height: 64, width: 64 }}
                  />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Telegram
                  </span>
                </motion.div>

                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon
                    url="https://wa.me/15716604984"
                    network="whatsapp"
                    className="shadow-lg group-hover:shadow-xl transition-all duration-300"
                    style={{ height: 64, width: 64 }}
                  />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    WhatsApp
                  </span>
                </motion.div>

                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon
                    url="https://www.facebook.com/share/17A6QTUppF/?mibextid=wwXIfr"
                    network="facebook"
                    className="shadow-lg group-hover:shadow-xl transition-all duration-300"
                    style={{ height: 64, width: 64 }}
                  />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Facebook
                  </span>
                </motion.div>

                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon
                    url="https://www.instagram.com/onestop_application_services?igsh=dXZrZXlkYjV1YXRh&utm_source=qr"
                    network="instagram"
                    className="shadow-lg group-hover:shadow-xl transition-all duration-300"
                    style={{ height: 64, width: 64 }}
                  />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Instagram
                  </span>
                </motion.div>

                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon
                    url="https://youtube.com/@onestopapplicationservicesllc?si=1cH9ZQ0IiDgvdYsl"
                    network="youtube"
                    className="shadow-lg group-hover:shadow-xl transition-all duration-300"
                    style={{ height: 64, width: 64 }}
                  />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    YouTube
                  </span>
                </motion.div>

                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SocialIcon
                    url="https://www.tiktok.com/@onestop.applicati?_t=ZP-90fcXx8MTGQ&_r=1"
                    network="tiktok"
                    className="shadow-lg group-hover:shadow-xl transition-all duration-300"
                    style={{ height: 64, width: 64 }}
                  />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    TikTok
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
