import {
  Appointment,
  AppointmentPeriod,
  AppointmentPeriodDay,
} from "@/types/appointments";
import { Appointment as AppointmentPrisma } from "@/generated/prisma/browser";

const getPeriod = (hour: number): AppointmentPeriodDay => {
  if (hour >= 9 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
};

function groupAppointmentByPeriod(
  appointment: AppointmentPrisma[]
): AppointmentPeriod[] {
  const transformAppointment: Appointment[] = appointment.map((apt) => ({
    ...apt,
    time: apt.scheduleAt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    service: apt.description,
    period: getPeriod(apt.scheduleAt.getHours()),
  }));

  const morning = transformAppointment.filter(
    (morning) => morning.period === "morning"
  );
  const afternoon = transformAppointment.filter(
    (afternoon) => afternoon.period === "afternoon"
  );
  const evening = transformAppointment.filter(
    (evening) => evening.period === "evening"
  );

  return [
    {
      title: "Manhã",
      type: "morning",
      timeRange: "09h-12h",
      appointments: morning,
    },
    {
      title: "Tarde",
      type: "afternoon",
      timeRange: "13h-18h",
      appointments: afternoon,
    },
    {
      title: "Noite",
      type: "evening",
      timeRange: "19h-21h",
      appointments: evening,
    },
  ];
}

export { groupAppointmentByPeriod, getPeriod };
