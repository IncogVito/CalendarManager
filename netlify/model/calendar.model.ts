export interface CurrentCalendarElement {
    eventId: number;
    startingDateTime: Date;
    endingDateTime: Date;
    location: string;
    changeable: boolean;
    availableAlongside: number[];
  }
  
export interface NewCalendarElement {
    name: string;
    index: number;
    durationTime: number;
    location: string;
  }