/**
 * From CodeWars -- https://www.codewars.com/kata/54b42f9314d9229fd6000d9c
 *
 * Convert a string to a new string where each character in the new string
 * is "(" if that character appears only once in the original string, or
 * ")" if that character appears more than once in the original string.
 * Ignore capitalization when determining if a character is a duplicate.
 *
 * # Examples
 * "din"      =>  "((("
 * "recede"   =>  "()()()"
 * "Success"  =>  ")())())"
 * "(( @"     =>  "))(("
 */
function duplicateEncode(text) {
  let textAsArray = text.toLowerCase().split(''),
    switchTable = {},
    newText = [];

  while (textAsArray.length) {
    let char = textAsArray.shift();

    if (!switchTable[char]) {
      if (textAsArray.indexOf(char) > -1) {
        switchTable[char] = ')';
      } else {
        switchTable[char] = '(';
      }
    }

    newText.push(switchTable[char]);
  }

  return newText.join('');
}
