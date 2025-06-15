
const SLOGANS = [
  "Controle financeiro de verdade.",
  "Sua vida financeira, plena.",
  "Transforme seus sonhos em conquistas.",
  "Planeje, realize, viva melhor.",
  "Disciplina hoje, plenitude amanhã.",
  "Acompanhe. Evolua. Conquiste.",
];

export function usePlenneSlogan() {
  function getRandomSlogan() {
    const index = Math.floor(Math.random() * SLOGANS.length);
    return SLOGANS[index];
  }
  return { getRandomSlogan };
}
