export interface InspirationPassage {
  text: string;
  reference: string;
}

const inspirationPassages: InspirationPassage[] = [
  { text: 'Servid a Jehová con alegría; venid ante su presencia con regocijo.', reference: 'Salmo 100:2' },
  { text: 'Todo lo que respira alabe a JAH. Aleluya.', reference: 'Salmo 150:6' },
  { text: 'Cantad a Jehová un cántico nuevo; cantad a Jehová, toda la tierra.', reference: 'Salmo 96:1' },
  { text: 'Bueno es alabarte, oh Jehová, y cantar salmos a tu nombre, oh Altísimo.', reference: 'Salmo 92:1' },
  { text: 'Mi corazón está dispuesto, oh Dios; cantaré y entonaré salmos.', reference: 'Salmo 57:7' },
  { text: 'Alabad a Jehová, porque él es bueno; porque para siempre es su misericordia.', reference: 'Salmo 106:1' },
  { text: 'Cantad a Jehová con alegría; cantad con júbilo y con sonido de trompeta.', reference: 'Salmo 98:4-6' },
  { text: 'Jehová es mi fortaleza y mi cántico, y él me ha sido por salvación.', reference: 'Salmo 118:14' },
];

export function getGreetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) {
    return 'Buenos días';
  }

  if (hour >= 12 && hour < 19) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export function getInspirationForDate(date: Date): InspirationPassage {
  const daySeed = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  const halfDay = date.getHours() >= 12 ? 1 : 0;
  const index = (daySeed * 2 + halfDay) % inspirationPassages.length;
  return inspirationPassages[index];
}

export function millisecondsUntilNextHomeContentChange(date: Date) {
  const next = new Date(date);

  if (date.getHours() < 12) {
    next.setHours(12, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }

  return next.getTime() - date.getTime();
}
