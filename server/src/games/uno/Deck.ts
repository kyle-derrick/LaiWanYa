import { UnoCard, UnoColor, UnoCardType } from './types';
import { v4 as uuidv4 } from 'uuid';

export function createDeck(): UnoCard[] {
  const deck: UnoCard[] = [];

  // For each color (red, yellow, green, blue)
  const colors = [UnoColor.RED, UnoColor.YELLOW, UnoColor.GREEN, UnoColor.BLUE];

  for (const color of colors) {
    // One 0 card per color
    deck.push({
      id: uuidv4(),
      color,
      type: UnoCardType.NUMBER,
      value: 0
    });

    // Two of each 1-9, Skip, Reverse, Draw2 per color
    for (let i = 1; i <= 9; i++) {
      deck.push({
        id: uuidv4(),
        color,
        type: UnoCardType.NUMBER,
        value: i
      });
      deck.push({
        id: uuidv4(),
        color,
        type: UnoCardType.NUMBER,
        value: i
      });
    }

    // Two Skip cards per color
    for (let i = 0; i < 2; i++) {
      deck.push({
        id: uuidv4(),
        color,
        type: UnoCardType.SKIP,
        value: null
      });
    }

    // Two Reverse cards per color
    for (let i = 0; i < 2; i++) {
      deck.push({
        id: uuidv4(),
        color,
        type: UnoCardType.REVERSE,
        value: null
      });
    }

    // Two Draw Two cards per color
    for (let i = 0; i < 2; i++) {
      deck.push({
        id: uuidv4(),
        color,
        type: UnoCardType.DRAW_TWO,
        value: null
      });
    }
  }

  // 4 Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: uuidv4(),
      color: UnoColor.WILD,
      type: UnoCardType.WILD,
      value: null
    });
  }

  // 4 Wild Draw Four cards
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: uuidv4(),
      color: UnoColor.WILD,
      type: UnoCardType.WILD_DRAW_FOUR,
      value: null
    });
  }

  return deck;
}

export function shuffleDeck(deck: UnoCard[]): UnoCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
