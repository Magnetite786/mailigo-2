import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Check,
  Loader2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays, isBefore, isToday, startOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmailSchedulerProps {
  onSchedule: (scheduleData: ScheduleData) => void;
  disabled?: boolean;
}

export interface ScheduleData {
  scheduled: boolean;
  date: Date | null;
  time: string;
}

const EmailScheduler = ({ onSchedule, disabled = false }: EmailSchedulerProps) => {
  const { toast } = useToast();
  const [isScheduled, setIsScheduled] = useState(false);
  const [date, setDate] = useState<Date | null>(addDays(new Date(), 1));
  const [time, setTime] = useState("09:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleSchedule = (value: boolean) => {
    setIsScheduled(value);
    if (!value) {
      onSchedule({ scheduled: false, date: null, time: "" });
    }
  };

  const handleSubmit = () => {
    if (!isScheduled) {
      return;
    }

    if (!date) {
      toast({
        title: "Select a date",
        description: "Please select a date for your scheduled email",
        variant: "destructive",
      });
      return;
    }

    const selectedDateTime = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    selectedDateTime.setHours(hours, minutes);

    if (isBefore(selectedDateTime, new Date())) {
      toast({
        title: "Invalid schedule time",
        description: "The scheduled time must be in the future",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSchedule({
        scheduled: true,
        date,
        time,
      });
      
      toast({
        title: "Email scheduled",
        description: `Your email will be sent on ${format(selectedDateTime, "PPP")} at ${format(selectedDateTime, "p")}`,
      });
      
      setIsSubmitting(false);
    }, 800);
  };

  const disabledDays = {
    before: startOfDay(new Date()),
  };

  // Generate time options in 30-minute intervals
  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const formattedHour = hour.toString().padStart(2, "0");
    return `${formattedHour}:${minute}`;
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          Schedule Email
        </CardTitle>
        <CardDescription>
          Set a specific date and time to send your email
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isScheduled}
              onCheckedChange={handleToggleSchedule}
              disabled={disabled}
            />
            <Label htmlFor="schedule-toggle" className="font-medium">
              Schedule for later
            </Label>
          </div>
          
          {isScheduled && (
            <Badge variant="outline" className="bg-primary/10">
              Scheduled
            </Badge>
          )}
        </div>
        
        {isScheduled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={disabled}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={disabledDays}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="mb-1 block">Time</Label>
                <Select
                  value={time}
                  onValueChange={setTime}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((timeOption) => (
                      <SelectItem key={timeOption} value={timeOption}>
                        {format(
                          new Date().setHours(
                            parseInt(timeOption.split(":")[0]),
                            parseInt(timeOption.split(":")[1])
                          ),
                          "p"
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {date && isToday(date) && (
              <div className="flex items-center text-sm text-amber-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                Scheduling for today will send the email at the specified time today
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>
                Your email will be queued and automatically sent at the scheduled time.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      {isScheduled && (
        <CardFooter className="pt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={isSubmitting || disabled || !date}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm Schedule
                      </>
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {!date
                  ? "Please select a date"
                  : `Schedule email for ${format(date, "PPP")} at ${format(
                      new Date().setHours(
                        parseInt(time.split(":")[0]),
                        parseInt(time.split(":")[1])
                      ),
                      "p"
                    )}`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      )}
    </Card>
  );
};

export default EmailScheduler; 