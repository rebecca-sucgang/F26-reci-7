import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.
// The test fails on the correct implementation. Read the counterexample: what's wrong, the property or the generator? Fix it by constructing valid inputs, not by filtering (.filter or fc.pre).
// const interval: fc.Arbitrary<Interval> = fc.tuple(fc.integer(), fc.integer());
// const intervalList = fc.array(interval);

const interval: fc.Arbitrary<Interval> = fc
  .tuple(fc.integer(), fc.integer())
  .map(([start, end]) => (start <= end ? [start, end] : [end, start]));
const intervalList = fc.array(interval);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  // Pattern: invariant. What must always be true about the output? The output is sorted.
  it('the output is sorted', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          expect(out[i][0]).toBeLessThanOrEqual(out[i + 1][0]);
        }
      }),
    );
  });

  // Pattern: differential. Can you write a tiny, obviously correct check of "is point p covered?" and compare input with output?
  // For every integer point p, the input covers p iff the output covers p.
  it('the input covers p iff the output covers p', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let p = -100; p <= 100; p++) {
          const inputCovers = xs.some(([s, e]) => s <= p && p <= e);
          const outputCovers = out.some(([s, e]) => s <= p && p <= e);
          expect(inputCovers).toEqual(outputCovers);
        }
      }),
    );
  });

  // Pattern: metamorphic. What change to the input should not change the output? 
  // Adding a duplicate interval should not change the output.
  it('adding a duplicate interval does not change the output', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out1 = mergeIntervals(xs);
        if (xs.length > 0) {
          const duplicate = xs[0];
          const out2 = mergeIntervals([...xs, duplicate]);
          expect(out1).toEqual(out2);
        }
      }),
    );
  });

  // Pattern: conditional. If the input is empty, the output is empty.
  it('if the input is empty, the output is empty', () => {
    expect(mergeIntervals([])).toEqual([]);
  });
});