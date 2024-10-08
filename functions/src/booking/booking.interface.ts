import { LanguageType } from 'src/shared/interfaces'

export interface IBookingSlot {
  id: string,
  start: number,
  end: number,
  isBooked: boolean,
  isPreBooked: boolean,
  bookedByEmail?: string
}

export interface IPreBooking {
  bookingSlots: IBookingSlot[],
  email: string,
  lang: LanguageType
}
