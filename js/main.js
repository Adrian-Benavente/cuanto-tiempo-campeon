import { intervalToDuration } from 'date-fns';

const {years, months, days, hours, minutes} = intervalToDuration({
  start: new Date(2022, 11, 18, 15, 0, 0),
  end: new Date(),
});

const D = document;
const yearsSlot = D.querySelector('.years');
const monthsSlot = D.querySelector('.months');
const daysSlot = D.querySelector('.days');
const hoursSlot = D.querySelector('.hours');
const minutesSlot = D.querySelector('.minutes');

yearsSlot.innerHTML = years > 0 ? `${years} años, ` : '';
monthsSlot.innerHTML = months > 0 ? `${months} meses, ` : '';
daysSlot.innerHTML = days > 0 ? (days > 1 ? `${days} días, ` : `${days} día, `) : '';
hoursSlot.innerHTML = hours > 0 ? `${hours} horas y ` : '';
minutesSlot.innerHTML = `${minutes} minutos`;
