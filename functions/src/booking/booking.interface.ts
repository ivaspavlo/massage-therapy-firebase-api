export interface IBookingSlot {
  id: string,
  start: number,
  end: number,
  isBooked: boolean,
  bookedBy?: string
}

export interface IBookingReq {
  bookingSlots: IBookingSlot[]
}
