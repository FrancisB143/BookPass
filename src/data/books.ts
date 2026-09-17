/**
 * Mock catalogue.
 *
 * Nothing outside `src/services/` may import this file. Screens talk to
 * services, services talk to data — so replacing this with a real API means
 * editing `src/services/books.ts` and nothing else.
 */

import type { Book } from '@/types';

export const BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    year: 1988,
    genre: 'Design',
    blurb:
      'Why do some doors tell you to push when they should be pulled? Norman argues that most everyday frustration is a design failure rather than a user failure, and lays out the principles that make objects understandable.',
    totalCopies: 4,
    cover: '🚪',
  },
  {
    id: '2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    year: 2008,
    genre: 'Software',
    blurb:
      'A practical catalogue of what separates code that a team can live with from code that quietly rots. Heavy on examples, opinionated about naming, and still the most argued-about book on most engineering shelves.',
    totalCopies: 6,
    cover: '🧼',
  },
  {
    id: '3',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: 2011,
    genre: 'Psychology',
    blurb:
      'Kahneman divides thought into a fast, intuitive system and a slow, deliberate one, then shows how reliably the fast one misleads us. A tour of the biases behind decisions we believe are rational.',
    totalCopies: 3,
    cover: '🧠',
  },
  {
    id: '4',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    year: 1999,
    genre: 'Software',
    blurb:
      'Short, self-contained lessons on the craft of programming: automate what you repeat, keep knowledge in one place, and leave code better than you found it.',
    totalCopies: 5,
    cover: '🛠️',
  },
  {
    id: '5',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: 2011,
    genre: 'History',
    blurb:
      'A sweeping account of how one unremarkable species of ape came to dominate the planet, told through the shared fictions — money, nations, religions — that let strangers cooperate at scale.',
    totalCopies: 4,
    cover: '🌍',
  },
  {
    id: '6',
    title: 'Refactoring',
    author: 'Martin Fowler',
    year: 1999,
    genre: 'Software',
    blurb:
      'A disciplined method for changing code without changing what it does, built from a catalogue of small, named, reversible transformations.',
    totalCopies: 2,
    cover: '♻️',
  },
  {
    id: '7',
    title: 'Educated',
    author: 'Tara Westover',
    year: 2018,
    genre: 'Memoir',
    blurb:
      'Westover was seventeen the first time she set foot in a classroom. A memoir about the cost of an education, and about what is lost as well as gained when you leave a family behind to get one.',
    totalCopies: 3,
    cover: '📖',
  },
  {
    id: '8',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    year: 2020,
    genre: 'Fiction',
    blurb:
      'Between life and death stands a library where every book is a life you could have lived. Nora Seed gets to try them, one regret at a time.',
    totalCopies: 5,
    cover: '🌙',
  },
  {
    id: '9',
    title: 'Atomic Habits',
    author: 'James Clear',
    year: 2018,
    genre: 'Self-help',
    blurb:
      'Behaviour change framed as a systems problem: make the habit you want obvious, attractive, easy and satisfying, and stop relying on motivation to carry you.',
    totalCopies: 7,
    cover: '⚛️',
  },
  {
    id: '10',
    title: 'Dune',
    author: 'Frank Herbert',
    year: 1965,
    genre: 'Science Fiction',
    blurb:
      'On a desert planet that holds the most valuable substance in the universe, a displaced noble family becomes entangled in a war over spice, water and prophecy.',
    totalCopies: 4,
    cover: '🏜️',
  },
];
