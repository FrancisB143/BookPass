/**
 * Mock community data.
 *
 * Only `src/services/` may import this file. Screens call services, services
 * read data — so swapping in a real API is a change to the service bodies and
 * nothing else.
 *
 * Titles and members mirror the Figma frames so the app looks like the design
 * on first run.
 */

import type { Book, Copy, ExchangeRequest, Loan, User } from '@/types';

export const CURRENT_USER_ID = 'u-alexa';

export const USERS: User[] = [
  {
    id: CURRENT_USER_ID,
    name: 'Alexa Reyes',
    rating: 4.8,
    swapCount: 12,
    hub: 'North Hall',
  },
  {
    id: 'u-sophie',
    name: 'Sophie Miller',
    rating: 4.9,
    swapCount: 18,
    hub: 'Library Cafe Hub',
  },
  {
    id: 'u-david',
    name: 'David Chen',
    rating: 5.0,
    swapCount: 32,
    hub: 'Student Union Dorm B',
  },
  {
    id: 'u-marcus',
    name: 'Marcus Lim',
    rating: 4.7,
    swapCount: 9,
    hub: 'Central Library',
  },
  {
    id: 'u-leo',
    name: 'Leo Katsaros',
    rating: 4.6,
    swapCount: 21,
    hub: 'East Arbor',
  },
];

export const BOOKS: Book[] = [
  {
    id: 'b-klara',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    genre: 'Sci-Fi',
    year: 2021,
    isbn: '9780571364886',
    blurb:
      'Klara is an Artificial Friend who watches the customers from her place in the store, hoping someone will choose her. A novel about what it means to love, told by a narrator who has only ever observed it.',
  },
  {
    id: 'b-ddia',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    genre: 'Tech',
    year: 2017,
    isbn: '9781449373320',
    blurb:
      'A guide to the trade-offs behind databases, queues and distributed systems — replication, partitioning, consistency — with the reasoning made explicit rather than assumed.',
  },
  {
    id: 'b-secret-history',
    title: 'The Secret History',
    author: 'Donna Tartt',
    genre: 'Fiction',
    year: 1992,
    isbn: '9781400031702',
    blurb:
      'A small group of classics students at an elite New England college drift into something irreversible. Tartt tells you what happens on the first page, then spends the novel making you understand it.',
  },
  {
    id: 'b-atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-help',
    year: 2018,
    isbn: '9780735211292',
    blurb:
      'Behaviour change framed as a systems problem: make the habit you want obvious, attractive, easy and satisfying, and stop relying on motivation to carry you.',
  },
  {
    id: 'b-dune',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Sci-Fi',
    year: 1965,
    isbn: '9780441013593',
    blurb:
      'On a desert planet holding the most valuable substance in the universe, a displaced noble family becomes entangled in a war over spice, water and prophecy.',
  },
  {
    id: 'b-pragmatic',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    genre: 'Tech',
    year: 1999,
    isbn: '9780135957059',
    blurb:
      'Short, self-contained lessons on the craft of programming: automate what you repeat, keep knowledge in one place, and leave code better than you found it.',
  },
  {
    id: 'b-educated',
    title: 'Educated',
    author: 'Tara Westover',
    genre: 'Memoir',
    year: 2018,
    isbn: '9780399590504',
    blurb:
      'Westover was seventeen the first time she set foot in a classroom. A memoir about the cost of an education, and what is lost as well as gained in getting one.',
  },
  {
    id: 'b-midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    year: 2020,
    isbn: '9780525559474',
    blurb:
      'Between life and death stands a library where every book is a life you could have lived. Nora Seed gets to try them, one regret at a time.',
  },
  {
    id: 'b-sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: 'History',
    year: 2011,
    isbn: '9780062316097',
    blurb:
      'How one unremarkable species of ape came to dominate the planet, told through the shared fictions — money, nations, religions — that let strangers cooperate at scale.',
  },
  {
    id: 'b-design-everyday',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    genre: 'Design',
    year: 1988,
    isbn: '9780465050659',
    blurb:
      'Why do some doors tell you to push when they should be pulled? Norman argues that most everyday frustration is a design failure rather than a user failure.',
  },
];

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const COPIES: Copy[] = [
  // --- Alexa's shelf ---
  {
    id: 'c-klara-alexa',
    bookId: 'b-klara',
    ownerId: CURRENT_USER_ID,
    condition: 'hardcover',
    status: 'on-shelf',
    hub: 'North Hall',
    distanceMi: 0,
    seeking: [],
    addedAt: daysFromNow(-2),
  },
  {
    id: 'c-ddia-alexa',
    bookId: 'b-ddia',
    ownerId: CURRENT_USER_ID,
    condition: 'paperback',
    status: 'lent-out',
    hub: 'North Hall',
    distanceMi: 0,
    seeking: [],
    addedAt: daysFromNow(-40),
  },
  {
    id: 'c-secret-alexa',
    bookId: 'b-secret-history',
    ownerId: CURRENT_USER_ID,
    condition: 'paperback',
    status: 'available-for-swap',
    hub: 'North Hall',
    distanceMi: 0,
    seeking: ['Sci-Fi', 'Tech'],
    addedAt: daysFromNow(-11),
  },
  {
    id: 'c-sapiens-alexa',
    bookId: 'b-sapiens',
    ownerId: CURRENT_USER_ID,
    condition: 'paperback',
    status: 'on-shelf',
    hub: 'North Hall',
    distanceMi: 0,
    seeking: [],
    addedAt: daysFromNow(-65),
  },
  {
    id: 'c-design-alexa',
    bookId: 'b-design-everyday',
    ownerId: CURRENT_USER_ID,
    condition: 'paperback',
    status: 'available-for-swap',
    hub: 'North Hall',
    distanceMi: 0,
    seeking: ['Memoir', 'History'],
    addedAt: daysFromNow(-20),
  },

  // --- The exchange ---
  {
    id: 'c-atomic-sophie',
    bookId: 'b-atomic-habits',
    ownerId: 'u-sophie',
    condition: 'hardcover',
    status: 'available-for-swap',
    hub: 'Library Cafe Hub',
    distanceMi: 0.3,
    seeking: ['Sci-Fi', 'Tech', 'Philosophy'],
    addedAt: daysFromNow(-5),
  },
  {
    id: 'c-dune-david',
    bookId: 'b-dune',
    ownerId: 'u-david',
    condition: 'paperback',
    status: 'available-for-swap',
    hub: 'Student Union Dorm B',
    distanceMi: 0.6,
    seeking: ['Classic Literature', 'History'],
    addedAt: daysFromNow(-8),
  },
  {
    id: 'c-pragmatic-leo',
    bookId: 'b-pragmatic',
    ownerId: 'u-leo',
    condition: 'paperback',
    status: 'available-for-swap',
    hub: 'East Arbor',
    distanceMi: 1.2,
    seeking: ['Design', 'Tech'],
    addedAt: daysFromNow(-3),
  },
  {
    id: 'c-educated-marcus',
    bookId: 'b-educated',
    ownerId: 'u-marcus',
    condition: 'hardcover',
    status: 'available-for-swap',
    hub: 'Central Library',
    distanceMi: 0.9,
    seeking: ['Fiction'],
    addedAt: daysFromNow(-14),
  },
  {
    id: 'c-midnight-sophie',
    bookId: 'b-midnight-library',
    ownerId: 'u-sophie',
    condition: 'paperback',
    status: 'available-for-swap',
    hub: 'Library Cafe Hub',
    distanceMi: 0.3,
    seeking: ['Memoir'],
    addedAt: daysFromNow(-6),
  },

  // --- Copies Alexa currently has out from others ---
  {
    id: 'c-atomic-david',
    bookId: 'b-atomic-habits',
    ownerId: 'u-david',
    condition: 'paperback',
    status: 'lent-out',
    hub: 'Student Union Dorm B',
    distanceMi: 0.6,
    seeking: [],
    addedAt: daysFromNow(-30),
  },
  {
    id: 'c-sapiens-marcus',
    bookId: 'b-sapiens',
    ownerId: 'u-marcus',
    condition: 'hardcover',
    status: 'lent-out',
    hub: 'Central Library',
    distanceMi: 0.9,
    seeking: [],
    addedAt: daysFromNow(-25),
  },
  {
    id: 'c-midnight-leo',
    bookId: 'b-midnight-library',
    ownerId: 'u-leo',
    condition: 'paperback',
    status: 'lent-out',
    hub: 'East Arbor',
    distanceMi: 1.2,
    seeking: [],
    addedAt: daysFromNow(-18),
  },
];

export const LOANS: Loan[] = [
  // Alexa lent her DDIA to Marcus.
  {
    id: 'l-ddia-marcus',
    copyId: 'c-ddia-alexa',
    lenderId: CURRENT_USER_ID,
    borrowerId: 'u-marcus',
    borrowedAt: daysFromNow(-10),
    dueAt: daysFromNow(4),
    returnedAt: null,
  },
  // Alexa is borrowing three books.
  {
    id: 'l-atomic-alexa',
    copyId: 'c-atomic-david',
    lenderId: 'u-david',
    borrowerId: CURRENT_USER_ID,
    borrowedAt: daysFromNow(-12),
    dueAt: daysFromNow(2),
    returnedAt: null,
  },
  {
    id: 'l-sapiens-alexa',
    copyId: 'c-sapiens-marcus',
    lenderId: 'u-marcus',
    borrowerId: CURRENT_USER_ID,
    borrowedAt: daysFromNow(-20),
    dueAt: daysFromNow(-3),
    returnedAt: null,
  },
  {
    id: 'l-midnight-alexa',
    copyId: 'c-midnight-leo',
    lenderId: 'u-leo',
    borrowerId: CURRENT_USER_ID,
    borrowedAt: daysFromNow(-4),
    dueAt: daysFromNow(10),
    returnedAt: null,
  },
];

export const REQUESTS: ExchangeRequest[] = [
  // Alexa proposed a swap to Leo — "ACTIVE PROPOSAL · Pending Leo K."
  {
    id: 'r-pragmatic',
    copyId: 'c-pragmatic-leo',
    fromUserId: CURRENT_USER_ID,
    toUserId: 'u-leo',
    kind: 'exchange',
    offeredCopyId: 'c-secret-alexa',
    status: 'pending',
    createdAt: daysFromNow(-1),
  },
  // Sophie wants to borrow Alexa's copy of The Design of Everyday Things.
  {
    id: 'r-design',
    copyId: 'c-design-alexa',
    fromUserId: 'u-sophie',
    toUserId: CURRENT_USER_ID,
    kind: 'borrow',
    offeredCopyId: null,
    status: 'pending',
    createdAt: daysFromNow(-2),
  },
];
