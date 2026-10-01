// Real 5-star Google reviews of Intertechnics, copied by hand from the
// Google Business profile. Static on purpose — no live fetching. The home
// page scrolls them sideways, so add as many as you like; the section stays
// hidden while this list is empty.
//
// Text is verbatim (line breaks are kept). Google only shows relative
// dates ("3 years ago"), so `date` is the approximate year.
const testimonials = [
  {
    id: 1,
    name: "MIkheili Kopilashvili",
    text: "წარმატებები ინტერტექნიკსს\nბობკატის დამტვირველები საუკეთესოა.",
    date: "2023",
  },
  {
    id: 2,
    name: "beko zhgenti",
    text: "საუკეთესო მომსახურება და სერვისი.",
    date: "2023",
  },
  {
    id: 3,
    name: "TEMKA 101",
    text: "საუკეთესო თავის საქმეში ❤️❤️❤️❤️❤️ Respect 🌟🌟🌟🌟",
    date: "2024",
  },
  {
    id: 4,
    name: "Nika Kuprashvili",
    text: "მაგრები ხართ 🙏👍",
    date: "2023",
  },
];

// Google Business profile, where the reviews above live.
export const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/4neRQhCwSaEWtPbv7";
// Total reviews on that profile (more than are quoted above) — update when
// new ones come in.
export const GOOGLE_REVIEW_COUNT = 12;

export default testimonials;
