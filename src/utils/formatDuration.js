import React from "react";

export function formatDuration({ years, months, days, hours, minutes }, detailed) {
  if (detailed) {
    return (
      <>
        {years > 0 ? (years > 1 ? `${years} años, ` : `${years} año, `) : ""}
        {months > 0
          ? months > 1
            ? `${months} meses, `
            : `${months} mes, `
          : ""}
        {days > 0 ? (days > 1 ? `${days} días, ` : `${days} día, `) : ""}
        {hours > 0
          ? hours > 1
            ? `${hours} horas y `
            : `${hours} hora y `
          : ""}
        {minutes === 1 ? `${minutes} minuto` : `${minutes} minutos`}
      </>
    );
  }

  return (
    <>
      {years > 0 ? (years > 1 ? `${years} años` : `${years} año`) : ""}
      {months > 0 ? (months > 1 ? `, ${months} meses` : `, ${months} mes`) : ""}
      {days > 0 ? (days > 1 ? ` y ${days} días` : ` y ${days} día`) : ""}
    </>
  );
}

export function getLiveCountdownParts(startDate, endDate) {
  const diffMs = Math.max(0, endDate - startDate);
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function padCountdownValue(value) {
  return String(value).padStart(2, "0");
}
