import React, { useState } from "react";
import { motion } from "framer-motion";
import { createBooking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, CheckCircle } from "lucide-react";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

const services = [
  "Content Creation",
  "Account Management",
  "Paid Advertising",
  "Web Development",
  "Strategy & Consulting",
  "Full-Service Package",
  "Not sure yet",
];

// Get next 14 available days (excluding Sundays)
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  let count = 0;
  let i = 1;

  while (count < 14) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) { // exclude Sundays
      dates.push(date);
      count++;
    }
    i++;
  }
  return dates;
};

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatDateValue = (date) =>
  date.toISOString().split("T")[0];

export default function BookingWidget() {
  const [step, setStep] = useState(1); // 1: date/time, 2: details, 3: done
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });
  const [error, setError] = useState(null);

  const availableDates = getAvailableDates();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        service: formData.service,
        date: formatDateValue(selectedDate),
        time: selectedTime,
        message: formData.message,
      });
      setStep(3);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0F1419] rounded-3xl p-12 text-center shadow-lg"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-3">
          Booking Confirmed!
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Your call is scheduled for
        </p>
        <p className="text-[#D4AF7A] font-semibold text-lg mb-6">
          {formatDate(selectedDate)} at {selectedTime}
        </p>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          We'll send a confirmation to <strong>{formData.email}</strong> shortly.
        </p>
        <Button
          onClick={() => {
            setStep(1);
            setSelectedDate(null);
            setSelectedTime(null);
            setFormData({ name: "", email: "", company: "", service: "", message: "" });
          }}
          variant="outline"
          className="mt-8"
        >
          Book Another Call
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1419] rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="h-2 bg-gradient-to-r from-[#D4AF7A] to-[#FF9A6C]" />
      <div className="p-8">
        <h3 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
          Book a Free Strategy Call
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          30 minutes · Free · No commitment
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= s
                    ? "bg-[#D4AF7A] text-white"
                    : "bg-gray-100 dark:bg-white/10 text-gray-400"
                }`}
              >
                {s}
              </div>
              <span className={`text-sm ${step >= s ? "text-[#1A2332] dark:text-white font-medium" : "text-gray-400"}`}>
                {s === 1 ? "Pick a time" : "Your details"}
              </span>
              {s < 2 && <div className="w-8 h-px bg-gray-200 dark:bg-white/10" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Date Picker */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-[#D4AF7A]" />
                <Label className="text-[#1A2332] dark:text-white font-medium">
                  Select a Date
                </Label>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 rounded-xl text-center text-xs transition-all border ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? "bg-[#D4AF7A] text-white border-[#D4AF7A]"
                        : "border-gray-200 dark:border-white/10 hover:border-[#D4AF7A] text-[#1A2332] dark:text-white"
                    }`}
                  >
                    <p className="font-medium">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p className="text-lg font-bold">{date.getDate()}</p>
                    <p className="opacity-70">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Picker */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-[#D4AF7A]" />
                  <Label className="text-[#1A2332] dark:text-white font-medium">
                    Select a Time
                  </Label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-xl text-sm transition-all border ${
                        selectedTime === time
                          ? "bg-[#D4AF7A] text-white border-[#D4AF7A]"
                          : "border-gray-200 dark:border-white/10 hover:border-[#D4AF7A] text-[#1A2332] dark:text-white"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-white font-semibold h-12 disabled:opacity-40"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Selected time summary */}
            <div className="flex items-center gap-3 p-4 bg-[#D4AF7A]/10 rounded-xl mb-6">
              <Calendar className="w-5 h-5 text-[#D4AF7A]" />
              <div>
                <p className="text-sm font-semibold text-[#1A2332] dark:text-white">
                  {formatDate(selectedDate)} at {selectedTime}
                </p>
                <p className="text-xs text-gray-500">30 minute strategy call</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-[#D4AF7A] hover:underline"
              >
                Change
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company / Brand Name</Label>
              <Input
                placeholder="Your company or brand"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Service Interested In</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => handleChange("service", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Anything we should know?</Label>
              <Textarea
                placeholder="Tell us about your brand and goals..."
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                className="resize-none min-h-[100px]"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email || submitting}
                className="flex-1 h-12 bg-[#D4AF7A] hover:bg-[#C49A5E] text-white font-semibold disabled:opacity-40"
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}