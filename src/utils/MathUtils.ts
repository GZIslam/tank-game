export const randomSign = () => (Math.random() < 0.5 ? -1 : 1)
export const randomIntInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min