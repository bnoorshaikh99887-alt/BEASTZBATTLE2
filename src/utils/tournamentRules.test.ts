import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDeposit,
  validateWithdrawal,
  calculateSlotsLeft,
  canJoinTournament,
  filterTournaments,
  validatePrivateCode,
  MIN_DEPOSIT_AMOUNT,
  MIN_WITHDRAW_AMOUNT,
} from './tournamentRules';
import { Tournament, User } from '../types';

const mockUser: User = {
  id: 'usr_1',
  name: 'Khush Chauhan',
  ign: 'BEAST_KHUSH',
  gameUid: '5129482194',
  phone: '+91 9876543210',
  email: 'chauhankhush89@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
  currentBalance: 500,
  bonusBalance: 50,
  isKycVerified: true,
  role: 'user',
  joinedMatches: ['tourn_existing'],
  totalMatches: 48,
  totalKills: 164,
  totalEarnings: 3850,
};

const mockTournaments: Tournament[] = [
  {
    id: 'tourn_1',
    title: 'BGMI Erangel Mega Championship',
    game: 'BGMI',
    mode: 'SQUAD BR',
    map: 'Erangel',
    matchNo: 'Match #101',
    dateTime: 'Today, 8:00 PM',
    timestamp: Date.now() + 3600000,
    entryFee: 50,
    prizePool: 4000,
    perKill: 25,
    totalSlots: 100,
    filledSlots: 82,
    status: 'upcoming',
    isPrivate: false,
    rules: ['Emulators strictly banned', 'All players must record gameplay'],
    firstPlacePrize: 2000,
    secondPlacePrize: 1000,
    thirdPlacePrize: 500,
  },
  {
    id: 'tourn_2',
    title: 'Free Fire Bermuda Clash Squad',
    game: 'Free Fire',
    mode: 'CLASH SQUAD',
    map: 'Bermuda',
    matchNo: 'Match #102',
    dateTime: 'Today, 9:00 PM',
    timestamp: Date.now() + 7200000,
    entryFee: 30,
    prizePool: 2500,
    perKill: 15,
    totalSlots: 48,
    filledSlots: 48, // Full
    status: 'upcoming',
    isPrivate: false,
    rules: ['Grenades allowed', 'PC prohibited'],
    firstPlacePrize: 1500,
    secondPlacePrize: 700,
    thirdPlacePrize: 300,
  },
  {
    id: 'tourn_private',
    title: 'Pro Beastz Private Scrims',
    game: 'BGMI',
    mode: 'SOLO BR',
    map: 'Miramar',
    matchNo: 'Private #01',
    dateTime: 'Tonight, 10:00 PM',
    timestamp: Date.now() + 10800000,
    entryFee: 100,
    prizePool: 5000,
    perKill: 40,
    totalSlots: 100,
    filledSlots: 40,
    status: 'upcoming',
    isPrivate: true,
    privateCode: 'BEASTZ777',
    rules: ['Level 40+ BGMI ID required'],
    firstPlacePrize: 2500,
    secondPlacePrize: 1500,
    thirdPlacePrize: 1000,
  },
];

test('validateDeposit should enforce minimum deposit rule', () => {
  const resultLow = validateDeposit(5);
  assert.equal(resultLow.valid, false);
  assert.match(resultLow.error!, /Minimum deposit/i);

  const resultOk = validateDeposit(100);
  assert.equal(resultOk.valid, true);
  assert.equal(resultOk.error, undefined);
});

test('validateWithdrawal should check balance and minimum amount', () => {
  const resultLow = validateWithdrawal(20, 500, 'khush@upi');
  assert.equal(resultLow.valid, false);
  assert.match(resultLow.error!, /Minimum withdrawal/i);

  const resultExcess = validateWithdrawal(600, 500, 'khush@upi');
  assert.equal(resultExcess.valid, false);
  assert.match(resultExcess.error!, /Insufficient/i);

  const resultNoUpi = validateWithdrawal(200, 500, '');
  assert.equal(resultNoUpi.valid, false);
  assert.match(resultNoUpi.error!, /valid UPI ID/i);

  const resultOk = validateWithdrawal(200, 500, 'khush@okhdfcbank');
  assert.equal(resultOk.valid, true);
});

test('calculateSlotsLeft returns correct count and never negative', () => {
  assert.equal(calculateSlotsLeft(100, 82), 18);
  assert.equal(calculateSlotsLeft(48, 48), 0);
  assert.equal(calculateSlotsLeft(50, 55), 0);
});

test('canJoinTournament checks already registered and full slots', () => {
  // Already registered
  const registeredTourn = { ...mockTournaments[0], id: 'tourn_existing' };
  const checkRegistered = canJoinTournament(registeredTourn, mockUser);
  assert.equal(checkRegistered.canJoin, false);
  assert.match(checkRegistered.reason!, /already registered/i);

  // Full tournament
  const checkFull = canJoinTournament(mockTournaments[1], mockUser);
  assert.equal(checkFull.canJoin, false);
  assert.match(checkFull.reason!, /slots are filled/i);

  // Valid join
  const checkOk = canJoinTournament(mockTournaments[0], mockUser);
  assert.equal(checkOk.canJoin, true);
});

test('filterTournaments correctly filters by game and capsule pills without breaking', () => {
  const allFiltered = filterTournaments(mockTournaments, 'ALL MATCHES', 'ALL', '');
  assert.equal(allFiltered.length, 3);

  const soloFiltered = filterTournaments(mockTournaments, 'SOLO BR', 'ALL', '');
  assert.equal(soloFiltered.length, 1);
  assert.equal(soloFiltered[0].mode, 'SOLO BR');

  const bgmiFiltered = filterTournaments(mockTournaments, 'ALL MATCHES', 'BGMI', '');
  assert.equal(bgmiFiltered.length, 2);

  const searchFiltered = filterTournaments(mockTournaments, 'ALL MATCHES', 'ALL', 'Bermuda');
  assert.equal(searchFiltered.length, 1);
  assert.equal(searchFiltered[0].map, 'Bermuda');
});

test('validatePrivateCode matches valid private tournaments case-insensitively', () => {
  const match = validatePrivateCode('beastz777', mockTournaments);
  assert.notEqual(match, null);
  assert.equal(match?.id, 'tourn_private');

  const invalidMatch = validatePrivateCode('WRONG123', mockTournaments);
  assert.equal(invalidMatch, null);
});
