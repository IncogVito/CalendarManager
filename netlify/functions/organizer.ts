import { CurrentCalendarElement, NewCalendarElement } from "../model/calendar.model";

interface DayConfig {
    startTime: Date;
    endTime: Date;
  }
  
  interface GeneralConstraints {
    minStartDate: Date;
    maxEndDate: Date;
    breakBetweenElements: number;
    changingAllowed: boolean;
  }
  
  interface EventsToBeUpdated {
    eventId: number;
    newStartingTime: Date;
    newEndingTime: Date;
  }
  
  interface NewEventsToBeAdded {
    name: string;
    location: string;
    startingTime: Date;
    endingTime: Date;
  }


  export function doTest(): Number {
    return 2;
  }
  
  function organizeCalendar(
    currentCalendar: CurrentCalendarElement[],
    newCalendarElements: NewCalendarElement[],
    dayConfig: DayConfig,
    generalConstraints: GeneralConstraints
  ): { eventsToBeUpdated: EventsToBeUpdated[], newEventsToBeAdded: NewEventsToBeAdded[] } {
    // Your implementation here
  
    // Placeholder
    const eventsToBeUpdated: EventsToBeUpdated[] = [];
    const newEventsToBeAdded: NewEventsToBeAdded[] = [];
  
    // Your complex algorithm logic here
  
    return { eventsToBeUpdated, newEventsToBeAdded };
  }
  
  // Example usage
  const currentCalendar: CurrentCalendarElement[] = [
    // Existing calendar events
  ];
  
  const newCalendarElements: NewCalendarElement[] = [
    // New calendar elements to be added
  ];
  
  const dayConfig: DayConfig = {
    startTime: new Date("2024-01-21T08:00:00"),
    endTime: new Date("2024-01-21T17:00:00"),
  };
  
  const generalConstraints: GeneralConstraints = {
    minStartDate: new Date("2024-01-21T08:00:00"),
    maxEndDate: new Date("2024-01-21T17:00:00"),
    breakBetweenElements: 15, // in minutes
    changingAllowed: true,
  };
  
  const result = organizeCalendar(currentCalendar, newCalendarElements, dayConfig, generalConstraints);
  
  console.log(result);

  export const handler = async (event: any, context: any) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Content-Type': 'application/json' },
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Success!", data: "WORKS" }),
        headers: { 'Content-Type': 'application/json' },
    };
};

