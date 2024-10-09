/**
 * From CodeWars -- https://www.codewars.com/kata/51e056fe544cf36c410000fb
 *
 * Write a function that, given a string of text (possibly with punctuation
 * and line-breaks), returns an array of the top-3 most occurring words, in
 * descending order of the number of occurrences. Assumptions:
 *   - A word is a string of letters (A to Z) optionally containing one or
 *       more apostrophes (') in ASCII;
 *   - Apostrophes can appear at the start, middle or end of a word ('abc,
 *       abc', 'abc', ab'c are all valid);
 *   - Any other characters (e.g. #, \, / , . ...) are not part of a word
 *       and should be treated as whitespace;
 *   - Matches should be case-insensitive, and the words in the result
 *       should be lowercased;
 *   - Ties may be broken arbitrarily;
 *   - If a text contains fewer than three unique words, then either the
 *       top-2 or top-1 words should be returned, or an empty array if
 *       a text contains no words;
 *
 * Examples:
 *
 * "In a village of La Mancha, the name of which I have no desire to call to
 * mind, there lived not long since one of those gentlemen that keep a lance
 * in the lance-rack, an old buckler, a lean hack, and a greyhound for
 * coursing. An olla of rather more beef than mutton, a salad on most
 * nights, scraps on Saturdays, lentils on Fridays, and a pigeon or so extra
 * on Sundays, made away with three-quarters of his income."
 *
 * --> ["a", "of", "on"]
 *
 * "e e e e DDD ddd DdD: ddd ddd aa aA Aa, bb cc cC e e e"
 *
 * --> ["e", "ddd", "aa"]
 *
 * "  //wont won't won't"
 *
 * --> ["won't", "wont"]
 */
function topThreeWords(text) {
  const scores = {};
  let i = text.length;
  let curWord = '';

  const checkCurWord = () => {
    if (curWord && curWord.match(/[^']/g)) {
      if (!scores[curWord]) {
        scores[curWord] = 0;
      }

      scores[curWord]++;
    }

    curWord = '';
  };

  while (i--) {
    const char = text[i].toLowerCase();

    if (char.match(/[a-zA-Z']/g)) {
      curWord = `${char}${curWord}`;
    } else {
      checkCurWord();
    }
  }

  checkCurWord();

  return Object.keys(scores).reduce((acc, word) => {
    const score = scores[word];

    if (acc.length === 3 && score < scores[acc[2]]) {
      return acc;
    }

    for (let i = 0; i < 3; i++) {
      const accWord = acc[i];

      if (!accWord
          || score > scores[accWord]
          || (score === scores[accWord] && word < accWord)
      ) {
        acc.splice(i, 0, word);
        break;
      }
    }

    return acc.slice(0, 3);
  }, []);
}
