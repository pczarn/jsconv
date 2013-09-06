var ADLER32_MOD = 65521; // Largest prime smaller than 65536
var ADLER_NMAX  = 5552; // From zlib docs: the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1

/**
 * From Wikipedia: Adler-32 is a checksum algorithm which
 * was invented by Mark Adler in 1995. Compared to a cyclic
 * redundancy check of the same length, it trades reliability
 * for speed. Adler-32 is more reliable than Fletcher-16,
 * and slightly less reliable than Fletcher-32.
 * 
 * @return number The checksum of the given string buffer
 * @throws Error when given anything but a string
 */
function adler32 (buffer, adler)
{
	if (typeof buffer != "string") {
		throw new Error("adler32 received a buffer that is not a string");
	}
	
	var s1 = adler === undefined ? 1 : (adler &  0xFFFF);      // Sum of all bytes
	var s2 = adler === undefined ? 0 : (adler >> 16) & 0xFFFF; // Sum of all s1 values
	var length = buffer.length;
	var n, i = 0;
	
	while (length > 0) {
		n = Math.min(length, ADLER_NMAX);
		length -= n;
		for (; n >= 16; n -= 16) {
			// s2 += (s1 += buffer.charCodeAt(i++)); // Maybe this one is slightly better? Need to test.
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
			s1 += buffer.charCodeAt(i++); s2 += s1;
		}
		while (n > 0) {
			s1 += buffer.charCodeAt(i++); s2 += s1;
			n--;
		}
		s1 %= ADLER32_MOD;
		s2 %= ADLER32_MOD;
	}
	
	return (s2 << 16) | s1; // or: (s2 * 65536) + s1
}

/**
 * This is a slower, but more straight-forward implementation.
 */
// function adler32 (buffer)
// {
// 	if (typeof buffer != "string") {
// 		throw new Error("adler32 received a buffer that is not a string");
// 	}
// 	
// 	var s1 = 1; // Sum of all bytes
// 	var s2 = 0; // Sum of all s1 values
// 	var b; // The current byte
// 	var i;
// 	
// 	for (i = 0; i < buffer.length; i++) {
// 		b = buffer.charCodeAt(i);
// 		s1 = (s1 + b)  % ADLER32_MOD;
// 		s2 = (s2 + s1) % ADLER32_MOD;
// 	}
// 	
// 	return (s2 << 16) | s1; // or: (s2 * 65536) + s1
// }
