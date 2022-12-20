import { intervalToDuration } from 'date-fns';

const D = document;
const yearsSlot = D.querySelector('.years');
const monthsSlot = D.querySelector('.months');
const daysSlot = D.querySelector('.days');
const hoursSlot = D.querySelector('.hours');
const minutesSlot = D.querySelector('.minutes');

const fillSlots = () => {
  const {years, months, days, hours, minutes} = intervalToDuration({
    start: new Date(2022, 11, 18, 15, 0, 0),
    end: new Date(),
  });
  yearsSlot.innerHTML = years > 0 ? (years > 1 ? `${years} años, ` : `${years} año, `) : '';
  monthsSlot.innerHTML = months > 0 ? (months > 1 ? `${months} meses, ` : `${months} mes, `) : '';
  daysSlot.innerHTML = days > 0 ? (days > 1 ? `${days} días, ` : `${days} día, `) : '';
  hoursSlot.innerHTML = hours > 0 ? (hours > 1 ? `${hours} horas y ` : `${hours} hora y `) : '';
  minutesSlot.innerHTML = minutes === 1 ? `${minutes} minuto` : `${minutes} minutos`;
};

document.addEventListener('DOMContentLoaded', fillSlots);

setInterval(fillSlots, 1000);
