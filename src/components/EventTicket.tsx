import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Phone, User, Calendar, QrCode } from "lucide-react";
import logo from "@/assets/Application_Services-removebg-preview.png";

interface EventTicketProps {
  registration: {
    full_name: string;
    phone_number: string;
    city_state: string;
    areas_of_interest: string[];
    created_at: string;
    id: string;
  };
}

export const EventTicket = ({ registration }: EventTicketProps) => {
  const firstName = registration.full_name.split(' ')[0];

  return (
    <div className="bg-white text-slate-900 overflow-hidden rounded-xl border-2 border-slate-200 shadow-2xl max-w-2xl mx-auto font-sans print:shadow-none print:border-slate-300">
      {/* Header / Brand */}
      <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-auto brightness-0 invert" />
          <div className="h-8 w-px bg-slate-700 mx-2" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">OFFICIAL TICKET</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">OneStop Application Services</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
            <CheckCircle2 className="w-3 h-3" />
            PAID
          </div>
        </div>
      </div>

      <div className="p-8 relative">
        {/* Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
          <img src={logo} alt="" className="w-96 grayscale scale-150 rotate-12" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendee Name</p>
              <h3 className="text-2xl font-bold text-slate-800">{registration.full_name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Date</p>
                <p className="font-semibold">{new Date(registration.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Number</p>
                <p className="font-mono text-xs font-bold">#REG-{registration.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{registration.phone_number}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{registration.city_state}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interested Fields</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {registration.areas_of_interest.map(area => (
                  <span key={area} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between border-l border-slate-100 pl-8 space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <QrCode className="w-32 h-32 text-slate-800" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Please present this ticket<br />at the entrance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center px-8">
        <p className="text-[10px] text-slate-400 italic">OneStop Application Services © {new Date().getFullYear()}</p>
        <div className="flex gap-4">
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valid for One Entry</p>
        </div>
      </div>
    </div>
  );
};
