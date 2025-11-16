"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  CalendarIcon,
  ChevronDownIcon,
  Clock,
  Dog,
  Loader2,
  Phone,
  User,
} from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useMask } from "@react-input/mask";
import { format, setHours, setMinutes, startOfToday } from "date-fns";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createAppointment } from "@/app/actions/createAppointment";
import { useState } from "react";

const appointmentFormSchema = z
  .object({
    tutorName: z.string().min(3, "O nome do tutor é obrigatorio"),
    petName: z.string().min(3, "O nome do pet é obrigatorio"),
    phone: z.string().min(11, "O telefone é obrigatorio"),
    description: z.string().min(3, "O descrição Fé obrigatorio"),
    scheduleAt: z
      .date({
        error: "A data é obrigatório",
      })
      .min(startOfToday(), {
        error: "A data não pode ser no passado.",
      }),
    time: z.string().min(1, "A hora é obrigatória"),
  })
  .refine(
    (data) => {
      const [hour, minutes] = data.time.split(":");
      const scheduleDateTime = setMinutes(
        setHours(data.scheduleAt, Number(hour)),
        Number(minutes)
      );
      return scheduleDateTime > new Date();
    },
    {
      path: ["time"],
      error: "O horário não pode ser no passado",
    }
  );

type AppointmensFormValues = z.infer<typeof appointmentFormSchema>;

const maskPhone = {
  mask: "(__) _____-____",
  replacement: { _: /\d/ },
};

export const AppointmentForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const refPhone = useMask(maskPhone);
  const form = useForm<AppointmensFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      description: "",
      petName: "",
      phone: "",
      tutorName: "",
      scheduleAt: undefined,
      time: "",
    },
  });

  const onSubmit = async (data: AppointmensFormValues) => {
    const [hour, minutes] = data.time.split(":");

    const scheduleAt = new Date(data.scheduleAt);
    scheduleAt.setHours(Number(hour), Number(minutes), 0, 0);

    const result = await createAppointment({
      ...data,
      scheduleAt,
    });

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Agendamento cirado com sucesso!`);

    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="brand">Novo agendamento</Button>
      </DialogTrigger>
      <DialogContent
        variant="appointment"
        overlayVariant="blurred"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle size="modal">Agende uma atendimento</DialogTitle>
          <DialogDescription size="modal">
            Preencha os dados do cliente pata realizar o agendamento
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tutorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label-medium-size text-content-primary">
                    Nome do tutor
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 transform text-content-brand"
                        size={20}
                      />
                      <Input
                        placeholder="Nome do tutor"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="petName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label-medium-size text-content-primary">
                    Nome do pet
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Dog
                        className="absolute left-3 top-1/2 -translate-y-1/2 transform text-content-brand"
                        size={20}
                      />
                      <Input
                        placeholder="Nome do pet"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label-medium-size text-content-primary">
                    Telefone
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 transform text-content-brand"
                        size={20}
                      />
                      <Input
                        placeholder="Telefone"
                        className="pl-10"
                        value={field.value}
                        onChange={field.onChange}
                        name={field.name}
                        ref={(ref) => {
                          refPhone.current = ref as HTMLInputElement;
                          field.ref(ref);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label-medium-size text-content-primary">
                    Descrição de serviço
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição de serviço"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              <FormField
                control={form.control}
                name="scheduleAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-label-medium-size text-content-primary">
                      Data
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between text-left font-normal bg-background-tertiary border-border-primary text-content-primary hover:bg-background-tertiary hover:border-border-secondary hover:text-content-primary focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-border-brand focus:border-border-brand focus-visible:border-border-brand",
                              !field.value && "text-content-secondary"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <CalendarIcon
                                className=" text-content-brand"
                                size={20}
                              />
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </div>
                            <ChevronDownIcon size={20} />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < startOfToday()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-label-medium-size text-content-primary">
                      Hora
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Clock className="text-content-brand" size={20} />
                            <SelectValue placeholder="--:-- --" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {times.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="brand"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Agendar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const generateTimeOptions = (): string[] => {
  const times = [];

  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 21 && minute > 0) break;
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      times.push(timeString);
    }
  }

  return times;
};

const times = generateTimeOptions();
