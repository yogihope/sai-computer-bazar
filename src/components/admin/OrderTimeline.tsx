import { CheckCircle2, Clock, Package, Truck, Home, RefreshCcw, CreditCard, Cpu, ShieldCheck } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "current" | "pending";
  icon: any;
}

interface OrderTimelineProps {
  events?: TimelineEvent[];
}

const defaultEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "Order Placed",
    description: "Order confirmed by customer",
    timestamp: "Jan 15, 2024 10:30 AM",
    status: "completed",
    icon: Package,
  },
  {
    id: "2",
    title: "Payment Initiated",
    description: "Payment processing started",
    timestamp: "Jan 15, 2024 10:31 AM",
    status: "completed",
    icon: CreditCard,
  },
  {
    id: "3",
    title: "Payment Confirmed",
    description: "₹1,25,999 received via UPI",
    timestamp: "Jan 15, 2024 10:32 AM",
    status: "completed",
    icon: CheckCircle2,
  },
  {
    id: "4",
    title: "Order Processing",
    description: "Preparing your order",
    timestamp: "Jan 15, 2024 11:00 AM",
    status: "completed",
    icon: Clock,
  },
  {
    id: "5",
    title: "Build In Progress",
    description: "Custom PC assembly started",
    timestamp: "Jan 16, 2024 09:00 AM",
    status: "completed",
    icon: Cpu,
  },
  {
    id: "6",
    title: "Quality Check",
    description: "48-hour stress testing",
    timestamp: "Jan 18, 2024 10:00 AM",
    status: "completed",
    icon: ShieldCheck,
  },
  {
    id: "7",
    title: "Shipped",
    description: "Dispatched via BlueDart",
    timestamp: "Jan 19, 2024 02:30 PM",
    status: "current",
    icon: Truck,
  },
  {
    id: "8",
    title: "Out for Delivery",
    description: "With delivery executive",
    timestamp: "Expected Jan 21, 2024",
    status: "pending",
    icon: Truck,
  },
  {
    id: "9",
    title: "Delivered",
    description: "Order completed",
    timestamp: "Expected Jan 21, 2024",
    status: "pending",
    icon: Home,
  },
];

export function OrderTimeline({ events = defaultEvents }: OrderTimelineProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
          line: "bg-emerald-500",
          text: "text-white",
          subtext: "text-gray-400",
        };
      case "current":
        return {
          icon: "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 animate-pulse",
          line: "bg-gradient-to-b from-emerald-500 to-gray-700",
          text: "text-cyan-400",
          subtext: "text-cyan-400/70",
        };
      default:
        return {
          icon: "bg-gray-700 text-gray-500",
          line: "bg-gray-700",
          text: "text-gray-500",
          subtext: "text-gray-600",
        };
    }
  };

  return (
    <div className="relative">
      {events.map((event, index) => {
        const styles = getStatusStyles(event.status);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={`absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)] ${styles.line}`}
              />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${styles.icon} transition-all duration-300`}
            >
              <event.icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold ${styles.text}`}>{event.title}</h4>
                {event.status === "current" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                    In Progress
                  </span>
                )}
              </div>
              <p className={`text-sm mt-0.5 ${styles.subtext}`}>{event.description}</p>
              <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
