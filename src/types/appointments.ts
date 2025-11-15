export type AppointmentPeriodDay = "morning" | "afternoon" | "evening";

export interface Appointment {
  id: string;
  time: string;
  petName: string;
  tutorName: string;
  phone: string;
  description: string;
  scheduleAt: Date;
  period: AppointmentPeriodDay;
}

export interface AppointmentPeriod {
  title: string;
  type: AppointmentPeriodDay;
  timeRange: string;
  appointments: Appointment[];
}
