// Demo data for the fictional "Aurelia Estates" agency.
// Used by the demo page AND by the AI chatbot on the server.
export const agency = {
  name: "Aurelia Estates",
  city: "Vilnius",
  hours: "Mon–Sat, 9:00–18:00",
  phone: "+370 600 00000 (demo)",
};

export const listings = [
  { id: 1, title: "Old Town Loft", type: "Apartment", deal: "rent", area: "Old Town", price: 1150, beds: 2, baths: 1, size: 68, note: "Exposed brick, balcony, 5 min to the cathedral.", hue: 28 },
  { id: 2, title: "Riverside Studio", type: "Apartment", deal: "rent", area: "Žvėrynas", price: 690, beds: 1, baths: 1, size: 34, note: "River views, furnished, ideal for students.", hue: 200 },
  { id: 3, title: "Pine Hill Villa", type: "House", deal: "buy", area: "Pavilnys", price: 485000, beds: 5, baths: 3, size: 240, note: "Private garden, sauna and double garage.", hue: 130 },
  { id: 4, title: "Skyline Penthouse", type: "Apartment", deal: "buy", area: "Šnipiškės", price: 412000, beds: 3, baths: 2, size: 124, note: "Rooftop terrace with panoramic city views.", hue: 255 },
  { id: 5, title: "Family Townhouse", type: "House", deal: "buy", area: "Pilaitė", price: 268000, beds: 4, baths: 2, size: 150, note: "Near schools and parks, new renovation.", hue: 45 },
  { id: 6, title: "Garden Flat", type: "Apartment", deal: "rent", area: "Antakalnis", price: 950, beds: 2, baths: 1, size: 61, note: "Ground floor with a private garden, pets allowed.", hue: 160 },
];
