import { Card, CardType, CardAction } from './types';
import { v4 as uuidv4 } from 'uuid';

export function createChanceCards(): Card[] {
  return [
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Advance to GO. Collect $200.',
      action: CardAction.MOVE_TO, value: 0
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Advance to Illinois Ave.',
      action: CardAction.MOVE_TO, value: 24
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Advance to St. Charles Place.',
      action: CardAction.MOVE_TO, value: 11
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Advance to nearest Utility.',
      action: CardAction.MOVE_FORWARD, value: -1 // special: nearest utility
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Advance to nearest Railroad.',
      action: CardAction.MOVE_FORWARD, value: -2 // special: nearest railroad
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Bank pays you dividend of $50.',
      action: CardAction.COLLECT, value: 50
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Get Out of Jail Free.',
      action: CardAction.GET_OUT_OF_JAIL
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Go Back 3 Spaces.',
      action: CardAction.MOVE_BACKWARD, value: 3
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Go to Jail. Do not pass GO.',
      action: CardAction.GO_TO_JAIL
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Make general repairs on all your property.',
      action: CardAction.REPAIRS, value: 25 // $25 per house, $100 per hotel
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Pay poor tax of $15.',
      action: CardAction.PAY, value: 15
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Take a ride on the Reading Railroad.',
      action: CardAction.MOVE_TO, value: 5
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Take a walk on the Boardwalk.',
      action: CardAction.MOVE_TO, value: 39
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'You have been elected Chairman. Pay each player $50.',
      action: CardAction.PAY_EACH, value: 50
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'Your building loan matures. Collect $150.',
      action: CardAction.COLLECT, value: 150
    },
    {
      id: uuidv4(), type: CardType.CHANCE,
      description: 'You have won a crossword competition. Collect $100.',
      action: CardAction.COLLECT, value: 100
    }
  ];
}

export function createCommunityChestCards(): Card[] {
  return [
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Advance to GO. Collect $200.',
      action: CardAction.MOVE_TO, value: 0
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Bank error in your favor. Collect $200.',
      action: CardAction.COLLECT, value: 200
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: "Doctor's fee. Pay $50.",
      action: CardAction.PAY, value: 50
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'From sale of stock you get $50.',
      action: CardAction.COLLECT, value: 50
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Get Out of Jail Free.',
      action: CardAction.GET_OUT_OF_JAIL
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Go to Jail. Do not pass GO.',
      action: CardAction.GO_TO_JAIL
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Grand Opera Night. Collect $50 from every player.',
      action: CardAction.COLLECT_FROM_EACH, value: 50
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Holiday fund matures. Receive $100.',
      action: CardAction.COLLECT, value: 100
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Income tax refund. Collect $20.',
      action: CardAction.COLLECT, value: 20
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'It is your birthday. Collect $10 from every player.',
      action: CardAction.COLLECT_FROM_EACH, value: 10
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Life insurance matures. Collect $100.',
      action: CardAction.COLLECT, value: 100
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Hospital fees. Pay $100.',
      action: CardAction.PAY, value: 100
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'School fees. Pay $50.',
      action: CardAction.PAY, value: 50
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Consultancy fee. Collect $25.',
      action: CardAction.COLLECT, value: 25
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'Street repairs. Pay $40 per house, $115 per hotel.',
      action: CardAction.REPAIRS, value: 40 // $40 per house, $115 per hotel
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'You have won second prize in a beauty contest. Collect $10.',
      action: CardAction.COLLECT, value: 10
    },
    {
      id: uuidv4(), type: CardType.COMMUNITY_CHEST,
      description: 'You inherit $100.',
      action: CardAction.COLLECT, value: 100
    }
  ];
}

export function shuffleCards(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
