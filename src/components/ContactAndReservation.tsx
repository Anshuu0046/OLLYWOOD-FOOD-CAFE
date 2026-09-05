import React, { useState } from 'react';
import { MapPin, Phone, Clock, Calendar, Users, CheckCircle2, Navigation } from 'lucide-react';
import { MAP_IMAGE } from '../data/menuData';
import { submitReservation } from '../services/posService';

interface ContactAndReservationProps {
  onShowToast: (msg: string) => void;
}

export const ContactAndReservation: React.FC<ContactAndReservationProps> = ({ onShowToast }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('08:00 PM');
  const [notes, setNotes] = useState('');
  const [isReserved, setIsReserved] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)');
      return;
    }

    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await submitReservation({
      name: name.trim(),
      phone: cleanPhone,
      guests,
      date,
      timeSlot,
      notes: notes.trim() || undefined,
    });

    setBookingRef(result.bookingRef);
    setIsReserved(true);
    setIsSubmitting(false);
    onShowToast(`Table booked successfully. Protocol Ref: ${result.bookingRef}`);
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#FDFCFB] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1A1A1A]/30">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-mono block">
              Location & Protocol / 2024
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1A1A1A] tracking-tight">
              Salon & Reservations
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed pt-1">
              Secure an assigned booth in our dining salon or arrange private culinary dining for special gatherings.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-right font-mono">
            <span className="text-3xl font-serif text-[#1A1A1A]">07</span>
            <span className="text-[10px] uppercase tracking-[0.2em] block opacity-50">Protocol</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Contact Information & Map Preview */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Quick Details Cards */}
            <div className="bg-[#FDFCFB] p-6 border border-[#1A1A1A] space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60">Physical Location</h4>
                  <p className="text-xs text-[#1A1A1A] mt-1 leading-relaxed font-serif">
                    Near Axis Bank, Ayodhya Nagar, Brahmapur (Berhampur), Ganjam, Odisha 760008
                  </p>
                  <p className="text-[10px] font-mono text-[#1A1A1A]/60 mt-0.5">
                    Coordinates: 19.3080° N, 84.8190° E
                  </p>
                  <a
                    href="https://maps.app.goo.gl/m1hVHBSrEFAkmraE8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A] hover:text-[#9E2A2B] mt-2 underline underline-offset-2 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-[#9E2A2B]" />
                    <span>Open in Google Maps / Get Directions ↗</span>
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1A1A1A]/20 flex items-start gap-4">
                <div className="w-8 h-8 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60">Telephone Desks</h4>
                  <p className="text-xs text-[#1A1A1A] font-mono mt-1">
                    Direct Line: <a href="tel:+919078266680" className="hover:text-[#9E2A2B] font-semibold">+91 90782 66680</a>
                  </p>
                  <p className="text-xs text-[#1A1A1A] font-mono">
                    Salon Desk: <a href="tel:+919876543210" className="hover:text-[#9E2A2B]">+91 98765 43210</a>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1A1A1A]/20 flex items-start gap-4">
                <div className="w-8 h-8 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/60">Salon Timings</h4>
                  <p className="text-xs text-[#1A1A1A] mt-1 font-mono">
                    Monday to Sunday: <strong>11:00 AM – 11:00 PM</strong>
                  </p>
                  <p className="text-[10px] font-mono text-[#1A1A1A]/60 mt-0.5">
                    Live hearth and kitchen orders cease at 10:45 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Map Visual / Interactive Embed Card */}
            <div className="relative border border-[#1A1A1A] bg-[#D1CFCA] p-2 aspect-16/10 sm:aspect-16/9 group overflow-hidden">
              <iframe
                title="Ollywood Food Cafe Berhampur Location Map"
                src="https://maps.google.com/maps?q=19.3080267,84.8189981&hl=en&z=17&output=embed"
                className="w-full h-full border-0 grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                loading="lazy"
                allowFullScreen
              />
              <div className="absolute top-4 right-4 z-10">
                <a
                  href="https://maps.app.goo.gl/m1hVHBSrEFAkmraE8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#FDFCFB] border border-[#1A1A1A] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Google Maps ↗</span>
                </a>
              </div>
              <div className="absolute bottom-4 left-4 z-10 bg-[#FDFCFB]/95 backdrop-blur-xs border border-[#1A1A1A] px-3 py-1 font-mono text-[10px] text-[#1A1A1A] flex items-center gap-2 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B] animate-pulse" />
                <span>Station: Ayodhya Nagar, Brahmapur (Berhampur)</span>
              </div>
            </div>

          </div>

          {/* Right Column: Table Reservation Form */}
          <div className="lg:col-span-6">
            <div className="bg-[#FDFCFB] p-6 sm:p-8 border border-[#1A1A1A]">
              
              <div className="mb-6 pb-4 border-b border-[#1A1A1A]/20">
                <h3 className="font-serif italic text-2xl font-bold text-[#1A1A1A]">
                  Table Reservation Protocol
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-1 font-mono">
                  Guaranteed priority seating with dedicated staff assignment.
                </p>
              </div>

              {isReserved ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 border border-[#1A1A1A] flex items-center justify-center mx-auto text-[#1A1A1A]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif italic text-xl font-bold text-[#1A1A1A]">
                    Reservation Registered
                  </h4>
                  <p className="text-xs text-[#1A1A1A]/70 max-w-sm mx-auto leading-relaxed">
                    A table has been allocated for <strong>{guests} guests</strong> on <strong>{date}</strong> at <strong>{timeSlot}</strong> registered under <strong>{name}</strong>.
                  </p>
                  <div className="p-3 bg-[#E8E6E1]/50 border border-[#1A1A1A] inline-block font-mono text-xs font-bold text-[#1A1A1A]">
                    Protocol Reference: {bookingRef}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsReserved(false);
                        setName('');
                        setPhone('');
                        setNotes('');
                      }}
                      className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A] underline hover:opacity-60"
                    >
                      Enter Another Booking
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReservationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Srikant Mohanty"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] font-mono focus:outline-none focus:bg-[#E8E6E1]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70 mb-1">
                        Contact Phone (10 digits) *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ''));
                          setPhoneError('');
                        }}
                        className="w-full px-3 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] font-mono focus:outline-none focus:bg-[#E8E6E1]/30"
                      />
                      {phoneError && (
                        <p className="text-[10px] font-mono text-[#9E2A2B] mt-1">{phoneError}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70 mb-1">
                        Guests
                      </label>
                      <div className="relative">
                        <Users className="w-3 h-3 text-[#1A1A1A]/60 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={guests}
                          onChange={(e) => setGuests(e.target.value)}
                          className="w-full pl-7 pr-2 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] font-mono"
                        >
                          <option value="1">1 Person</option>
                          <option value="2">2 Guests</option>
                          <option value="4">4 Guests</option>
                          <option value="6">6 Guests</option>
                          <option value="8">8 Guests</option>
                          <option value="10">10+ Guests</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-2 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70 mb-1">
                        Time Slot
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-2 py-2 text-xs bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] font-mono"
                      >
                        <optgroup label="Lunch Slots">
                          <option value="12:30 PM">12:30 PM</option>
                          <option value="01:30 PM">01:30 PM</option>
                          <option value="02:30 PM">02:30 PM</option>
                        </optgroup>
                        <optgroup label="Dinner Slots">
                          <option value="07:00 PM">07:00 PM</option>
                          <option value="08:00 PM">08:00 PM</option>
                          <option value="09:00 PM">09:00 PM</option>
                          <option value="10:00 PM">10:00 PM</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-[#1A1A1A]/70 mb-1">
                      Special Celebration / Requests (optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Anniversary seating, quiet booth, child chair..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#FDFCFB] border border-[#1A1A1A] text-[#1A1A1A] font-mono focus:outline-none focus:bg-[#E8E6E1]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    id="submit-table-booking-btn"
                    className="w-full py-3 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-semibold border border-[#1A1A1A] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Execute Reservation Protocol</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
